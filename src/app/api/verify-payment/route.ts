import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

// Cliente admin de Supabase para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    console.log('🔍 Verificando sesión:', sessionId);

    if (!sessionId) {
      console.error('❌ Session ID requerido');
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    // Obtener información de la sesión de Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent', 'total_details']
      });
    } catch (stripeError) {
      console.error('❌ Error obteniendo sesión de Stripe:', stripeError);
      return NextResponse.json({ 
        success: false, 
        error: 'Session not found or invalid',
        details: stripeError instanceof Error ? stripeError.message : 'Unknown error'
      }, { status: 404 });
    }

    if (!session) {
      console.error('❌ Sesión no encontrada');
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    console.log('💰 Estado del pago:', {
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      discount: session.total_details?.amount_discount,
      status: session.status,
      customer_details: !!session.customer_details
    });

    // Verificar si la sesión está completada
    if (session.status === 'open') {
      console.log('⚠️ Sesión abierta - checkout no completado');
      return NextResponse.json({ 
        success: false,
        error: 'Checkout not completed',
        details: 'The checkout session is still open. Please complete the payment process.',
        session_status: session.status,
        payment_status: session.payment_status
      }, { status: 400 });
    }

    // Verificar si el pago fue exitoso
    if (session.payment_status !== 'paid') {
      console.log('❌ Pago no completado:', session.payment_status);
      return NextResponse.json({ 
        success: false,
        error: 'Payment not completed',
        status: session.payment_status,
        session_status: session.status,
        details: 'The payment was not completed successfully. Please try again.'
      }, { status: 400 });
    }

    // Verificar que hay detalles del cliente
    if (!session.customer_details?.email) {
      console.log('❌ No hay email del cliente');
      return NextResponse.json({ 
        success: false,
        error: 'Customer email not found',
        details: 'The checkout was completed but no customer email was provided.'
      }, { status: 400 });
    }

    // Buscar la compra en nuestra base de datos
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('user_purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('Error fetching purchase:', purchaseError);
      return NextResponse.json({ 
        success: false,
        error: 'Error fetching purchase data',
        details: purchaseError.message
      }, { status: 500 });
    }

    // Calcular monto total y descuento aplicado
    const totalAmount = session.amount_total || 0;
    const subtotal = session.amount_subtotal || 0;
    const discountAmount = session.total_details?.amount_discount || 0;
    const hasDiscount = discountAmount > 0;
    const isFreePurchase = totalAmount === 0; // Un pago es gratuito si el total es 0

    console.log('📊 Detalles del pago:', {
      totalAmount,
      subtotal,
      discountAmount,
      hasDiscount,
      isFreePurchase,
      isProcessed: !!purchase,
      customerEmail: session.customer_details?.email
    });

    // Para pagos gratuitos, si no está procesado, intentar procesarlo manualmente
    if (isFreePurchase && !purchase) {
      console.log('🔄 Pago gratuito no procesado, intentando procesar manualmente...');
      
      try {
        // Simular el procesamiento del webhook para pagos gratuitos
        await processFreePurchase(session);
        console.log('✅ Pago gratuito procesado manualmente');
        
        // Buscar la compra nuevamente después del procesamiento
        const { data: newPurchase, error: newPurchaseError } = await supabaseAdmin
          .from('user_purchases')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
          
        if (!newPurchaseError && newPurchase) {
          console.log('✅ Compra encontrada después del procesamiento manual');
        }
      } catch (error) {
        console.error('❌ Error procesando pago gratuito:', error);
        // Continuar con la respuesta normal
      }
    }

    // Preparar respuesta con toda la información necesaria
    return NextResponse.json({
      success: true,
      session: {
        amountTotal: totalAmount,
        amountSubtotal: subtotal,
        discountAmount: discountAmount,
        hasDiscount: hasDiscount,
        isFreePurchase: isFreePurchase,
        customerEmail: session.customer_details?.email,
        productName: session.metadata?.productName || 'Curso',
        courseType: session.metadata?.courseType,
        productType: session.metadata?.productType,
        metadata: {
          tempPassword: session.metadata?.tempPassword,
          userEmail: session.metadata?.userEmail
        }
      },
      purchase: purchase,
      isProcessed: !!purchase // Indica si el webhook ya procesó la compra
    });

  } catch (error) {
    console.error('Error processing payment verification:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error processing payment verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Función para procesar pagos gratuitos manualmente
async function processFreePurchase(session: Stripe.Checkout.Session) {
  if (!session.customer_details?.email) {
    throw new Error('Missing customer email');
  }

  // Usar valores por defecto si no hay metadata
  const productName = session.metadata?.productName || 'Curso CIENCIAS Completo';
  const productType = session.metadata?.productType || 'course';
  const courseType = session.metadata?.courseType || 'CIENCIAS';
  const productId = session.metadata?.productId || 'prod_ciencias_completo';

  const email = session.customer_details.email;

  console.log('👤 Procesando usuario:', email);

  // Verificar si el usuario ya existe
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    throw new Error('Error listing users');
  }
  
  const existingUser = existingUsers.users.find((user) => user.email === email);
  
  let userId: string;
  
  if (existingUser) {
    userId = existingUser.id;
    console.log(`✅ Usuario ya existe: ${userId}`);
  } else {
    // Generar una contraseña temporal
    const tempPassword = generateRandomPassword();
    
    // Crear usuario automáticamente
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        created_via_payment: true,
        stripe_customer_id: session.customer as string
      }
    });

    if (createError) {
      throw new Error('Error creating user');
    }

    userId = newUser.user.id;
    console.log(`✅ Usuario creado: ${userId} para email: ${email}`);

    // Guardar la contraseña temporal en metadata para mostrarla al usuario
    session.metadata = {
      ...session.metadata,
      tempPassword: tempPassword,
      userEmail: email
    };
  }

  // Calcular fecha de expiración (1 año desde ahora)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Crear registro de compra
  const { data: purchase, error: purchaseError } = await supabaseAdmin
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
    throw new Error('Error creating purchase record');
  }

  console.log('✅ Registro de compra creado:', purchase.id);

  // Procesar acceso al contenido (para curso completo)
  const contentAccess = session.metadata?.contentAccess;
  if (contentAccess) {
    const contentAccessList = JSON.parse(contentAccess);
    
    for (const access of contentAccessList) {
      await supabaseAdmin
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
    
    console.log('✅ Acceso al contenido configurado');
  } else {
    // Si no hay metadata de acceso, crear acceso por defecto al curso completo
    await supabaseAdmin
      .from('content_access')
      .insert({
        user_id: userId,
        purchase_id: purchase.id,
        content_type: 'course',
        content_id: 'ciencias-completo',
        course_type: courseType,
        expires_at: expiresAt.toISOString()
      });
    
    console.log('✅ Acceso por defecto al curso configurado');
  }

  console.log(`✅ Pago gratuito procesado exitosamente para usuario ${userId}, producto ${productId}`);
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