import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/lib/email-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🎯 Processing completed checkout session:', session.id);
  console.log('💰 Session amount_total:', session.amount_total);
  console.log('💰 Session amount_subtotal:', session.amount_subtotal);
  console.log('🎫 Session discounts:', session.total_details?.amount_discount);
  console.log('📧 Customer email:', session.customer_details?.email);
  
  if (!session.metadata) {
    console.error('❌ No metadata found in session');
    return;
  }

  const {
    productId,
    productName,
    productType,
    courseType,
    contentAccess
  } = session.metadata;

  if (!productId || !productName || !productType) {
    console.error('❌ Missing required metadata');
    return;
  }
  
  console.log('✅ Processing product:', productName, 'Type:', productType);

  try {
    let userId: string;
    const email = session.customer_details?.email;

    if (!email) {
      console.error('❌ No email found in session');
      return;
    }

    // Verificar si el usuario ya existe
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    const existingUser = existingUsers.users.find(user => user.email === email);
    
    let tempPassword: string | null = null;
    let isNewUser = false;
    
    if (existingUser) {
      userId = existingUser.id;
      console.log(`User already exists: ${userId}`);
    } else {
      // Generar una contraseña temporal
      tempPassword = generateRandomPassword();
      isNewUser = true;
      
      // Crear usuario automáticamente
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: {
          created_via_payment: true,
          stripe_customer_id: session.customer as string,
          temp_password: tempPassword, // Guardar la contraseña temporal en metadata
          created_at: new Date().toISOString()
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }

      userId = newUser.user.id;
      console.log(`✅ Created new user: ${userId} for email: ${email}`);
    }

    // Calcular fecha de expiración (1 año desde ahora)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Crear registro de compra
    const { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_id: userId,
        stripe_product_id: productId,
        stripe_price_id: session.line_items?.data[0]?.price?.id || '',
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        product_name: productName,
        product_type: productType,
        course_type: courseType || 'complete',
        amount: session.amount_total || 0,
        currency: session.currency || 'eur',
        status: 'completed',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError);
      return;
    }

    // Procesar acceso al contenido
    if (contentAccess) {
      const contentAccessList = JSON.parse(contentAccess);
      
      for (const access of contentAccessList) {
        await supabase
          .from('content_access')
          .insert({
            user_id: userId,
            purchase_id: purchase.id,
            content_type: access.type,
            content_id: access.id,
            course_type: access.courseType,
            expires_at: expiresAt.toISOString()
          });
      }
    }

    // Enviar emails
    const emailPromises = [];
    
    // Email de bienvenida para usuarios nuevos
    if (isNewUser && tempPassword) {
      emailPromises.push(
        EmailService.sendWelcomeEmail({
          email: email,
          tempPassword: tempPassword,
          productName: productName,
          expiresAt: expiresAt.toLocaleDateString('es-ES')
        }).then(success => ({
          type: 'welcome',
          success,
          email
        }))
      );
    }
    
    // Email de confirmación de pago para todos los usuarios
    emailPromises.push(
      EmailService.sendPaymentConfirmation({
        email: email,
        productName: productName,
        amount: `${((session.amount_total || 0) / 100).toFixed(2)}€`,
        transactionId: session.payment_intent as string || session.id,
        purchaseDate: new Date().toLocaleDateString('es-ES'),
        expiresAt: expiresAt.toLocaleDateString('es-ES')
      }).then(success => ({
        type: 'confirmation',
        success,
        email
      }))
    );

    // Enviar emails en paralelo
    try {
      const emailResults = await Promise.all(emailPromises);
      
      let welcomeEmailSent = false;
      let confirmationEmailSent = false;
      
      emailResults.forEach(result => {
        if (result.type === 'welcome') {
          welcomeEmailSent = result.success;
          console.log(result.success 
            ? `✅ Email de bienvenida enviado a: ${result.email}` 
            : `❌ Error enviando email de bienvenida a: ${result.email}`
          );
        } else if (result.type === 'confirmation') {
          confirmationEmailSent = result.success;
          console.log(result.success 
            ? `✅ Email de confirmación enviado a: ${result.email}` 
            : `❌ Error enviando email de confirmación a: ${result.email}`
          );
        }
      });

      // Actualizar los metadatos de la sesión de Stripe
      if (isNewUser && tempPassword) {
        try {
          await stripe.checkout.sessions.update(session.id, {
            metadata: {
              ...session.metadata,
              tempPassword: tempPassword,
              userEmail: email,
              welcomeEmailSent: welcomeEmailSent.toString(),
              confirmationEmailSent: confirmationEmailSent.toString()
            }
          });
        } catch (updateError) {
          console.error('Error updating session metadata:', updateError);
        }
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
    }

    console.log(`✅ Successfully processed purchase for user ${userId}, product ${productId}`);
  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Puedes agregar lógica adicional aquí si es necesario
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);
  
  // Actualizar el estado de la compra a 'failed'
  if (paymentIntent.metadata?.purchaseId) {
    await supabase
      .from('user_purchases')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntent.id);
  }
}

// Función para generar contraseña aleatoria
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
} 