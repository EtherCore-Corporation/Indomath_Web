import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

// Mapeo de productos Stripe a contenido de la aplicación
const PRODUCT_MAPPING = {
  // Cursos completos
  'prod_SZ30zG3uAmx1wI': { // Curso CIENCIAS Completo
    name: 'Curso CIENCIAS Completo',
    type: 'course',
    courseType: 'CIENCIAS',
    contentAccess: [
      { type: 'course', id: 'ciencias', courseType: 'CIENCIAS' },
      { type: 'module', id: 'algebra-ciencias', courseType: 'CIENCIAS' },
      { type: 'module', id: 'geometria-ciencias', courseType: 'CIENCIAS' },
      { type: 'module', id: 'analisis-ciencias', courseType: 'CIENCIAS' }
    ]
  },
  'prod_SZ30I1y3Hn296F': { // Curso CCSS Completo
    name: 'Curso CCSS Completo',
    type: 'course',
    courseType: 'CCSS',
    contentAccess: [
      { type: 'course', id: 'ccss', courseType: 'CCSS' },
      { type: 'module', id: 'algebra-ccss', courseType: 'CCSS' },
      { type: 'module', id: 'analisis-ccss', courseType: 'CCSS' },
      { type: 'module', id: 'estadistica-ccss', courseType: 'CCSS' }
    ]
  },
  
  // Módulos individuales CIENCIAS
  'prod_SZ30p6YidW9NY3': { // ALGEBRA Y MATRICES - CIENCIAS
    name: 'ALGEBRA Y MATRICES - CIENCIAS',
    type: 'module',
    courseType: 'CIENCIAS',
    contentAccess: [
      { type: 'module', id: 'algebra-ciencias', courseType: 'CIENCIAS' }
    ]
  },
  'prod_SZ30Y65s7YLY6j': { // GEOMETRIA - CIENCIAS
    name: 'GEOMETRIA - CIENCIAS',
    type: 'module',
    courseType: 'CIENCIAS',
    contentAccess: [
      { type: 'module', id: 'geometria-ciencias', courseType: 'CIENCIAS' }
    ]
  },
  'prod_SZ30PKY53NKvgb': { // ANALISIS - CIENCIAS
    name: 'ANALISIS - CIENCIAS',
    type: 'module',
    courseType: 'CIENCIAS',
    contentAccess: [
      { type: 'module', id: 'analisis-ciencias', courseType: 'CIENCIAS' }
    ]
  },
  
  // Módulos individuales CCSS
  'prod_SZ30tv7L9OX0sj': { // ALGEBRA Y MATRICES - CCSS
    name: 'ALGEBRA Y MATRICES - CCSS',
    type: 'module',
    courseType: 'CCSS',
    contentAccess: [
      { type: 'module', id: 'algebra-ccss', courseType: 'CCSS' }
    ]
  },
  'prod_SZ30S9F1bqbFkc': { // ANALISIS - CCSS
    name: 'ANALISIS - CCSS',
    type: 'module',
    courseType: 'CCSS',
    contentAccess: [
      { type: 'module', id: 'analisis-ccss', courseType: 'CCSS' }
    ]
  },
  'prod_SZ30tWoLlp5JXe': { // ESTADISTICA Y PROBABILIDAD - CCSS
    name: 'ESTADISTICA Y PROBABILIDAD - CCSS',
    type: 'module',
    courseType: 'CCSS',
    contentAccess: [
      { type: 'module', id: 'estadistica-ccss', courseType: 'CCSS' }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { priceId, productId, couponCode, successUrl, cancelUrl } = await request.json();

    // Verificar que el producto existe en nuestro mapeo
    const productInfo = PRODUCT_MAPPING[productId as keyof typeof PRODUCT_MAPPING];
    if (!productInfo) {
      return NextResponse.json({ error: 'Producto no válido' }, { status: 400 });
    }

    // Obtener el precio del producto
    const price = await stripe.prices.retrieve(priceId);
    if (!price || price.unit_amount === null) {
      return NextResponse.json({ error: 'Precio no válido' }, { status: 400 });
    }

    // Crear la sesión de checkout
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      metadata: {
        productId: productId,
        productName: productInfo.name,
        productType: productInfo.type,
        courseType: productInfo.courseType,
        contentAccess: JSON.stringify(productInfo.contentAccess),
        createUser: 'true' // Indicar que se debe crear usuario automáticamente
      },
      // Permitir que el usuario ingrese su email durante el checkout
      billing_address_collection: 'required',
      customer_creation: 'always', // Crear cliente automáticamente
      // Habilitar Google Pay y Apple Pay
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    };

    // Aplicar cupón si se proporciona
    if (couponCode && couponCode.trim()) {
      try {
        // Verificar que el cupón existe y es válido
        const coupon = await stripe.coupons.retrieve(couponCode.trim());
        if (coupon.valid) {
          sessionConfig.discounts = [{
            coupon: couponCode.trim()
          }];
        }
      } catch (couponError) {
        console.log('Cupón no válido:', couponCode, couponError);
        // No aplicar el cupón pero continuar con la compra
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 