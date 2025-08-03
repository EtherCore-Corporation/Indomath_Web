import { useState } from 'react';

interface PaymentProduct {
  productId: string;
  priceId: string;
  name: string;
  price: number;
  type: 'course' | 'module';
  courseType?: 'CIENCIAS' | 'CCSS';
  couponCode?: string;
}

interface UsePaymentReturn {
  isLoading: boolean;
  error: string | null;
  createCheckoutSession: (product: PaymentProduct) => Promise<void>;
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (product: PaymentProduct) => {
    setIsLoading(true);
    setError(null);

    try {
      // Crear la sesión de checkout sin autenticación previa
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          productId: product.productId,
          couponCode: product.couponCode,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la sesión de pago');
      }

      const { url } = await response.json();

      if (url) {
        // Redirigir al usuario a Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCheckoutSession,
  };
} 