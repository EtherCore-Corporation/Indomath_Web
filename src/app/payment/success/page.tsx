'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<{
    productName?: string;
    amount?: string;
    originalAmount?: string | null;
    discount?: string | null;
    hasDiscount?: boolean;
    isFreePurchase?: boolean;
    expiresAt?: string;
    email?: string;
    isProcessed?: boolean;
    courseType?: string;
    productType?: string;
    tempPassword?: string;
    error?: boolean;
  } | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [userCreated, setUserCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'checkout' | 'payment' | 'verification' | null>(null);
  const maxRetries = 5;

  useEffect(() => {
    // Si no hay session_id, mostrar error inmediatamente
    if (!sessionId) {
      console.log('❌ No hay session_id en la URL');
      setError('No se encontró información de pago. Por favor, asegúrate de haber completado el proceso de pago correctamente.');
      setErrorType('verification');
      setIsLoading(false);
      return;
    }

    // Verificar el estado del pago con nuestra API
    const verifyPayment = async () => {
      try {
        console.log(`🔄 Verificando pago (intento ${retryCount + 1}/${maxRetries})...`);
        console.log('🔍 Session ID:', sessionId);
            
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        
        console.log('📊 Respuesta de verificación:', data);
        
        if (data.success) {
          const { session, purchase, isProcessed } = data;
          
          // Formatear el monto
          const amount = session.amountTotal / 100;
          const originalAmount = session.amountSubtotal / 100;
          const discount = session.discountAmount / 100;
          
          setPurchaseDetails({
            productName: session.productName,
            amount: `${amount.toFixed(2)}€`,
            originalAmount: session.hasDiscount ? `${originalAmount.toFixed(2)}€` : null,
            discount: session.hasDiscount ? `${discount.toFixed(2)}€` : null,
            hasDiscount: session.hasDiscount,
            isFreePurchase: session.isFreePurchase,
            expiresAt: purchase?.expiresAt 
              ? new Date(purchase.expiresAt).toLocaleDateString('es-ES')
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            email: session.customerEmail,
            isProcessed: isProcessed,
            courseType: session.courseType,
            productType: session.productType,
            tempPassword: session.metadata?.tempPassword
          });

          // Verificar si el usuario existe
          const { data: { user } } = await supabase.auth.getUser();
          setIsNewUser(!user);

          // Si el pago está procesado pero no hay usuario autenticado, 
          // significa que se creó un usuario automáticamente
          if (isProcessed && !user && session.customerEmail) {
            console.log('👤 Usuario creado automáticamente, mostrando instrucciones...');
            console.log('📧 Email de bienvenida enviado automáticamente');
            setUserCreated(true);
          }

          if (!isProcessed && retryCount < maxRetries) {
            // Si el pago aún no está procesado, intentar verificar nuevamente
            console.log('⏳ Pago no procesado aún, reintentando en 3 segundos...');
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPayment();
            }, 3000);
          } else if (isProcessed && user) {
            // Si el usuario está autenticado y el pago está procesado, redirigir al dashboard
            console.log('✅ Pago procesado y usuario autenticado, redirigiendo a cursos...');
            setTimeout(() => {
              window.location.href = '/cursos';
            }, 2000);
          } else if (retryCount >= maxRetries) {
            console.log('⚠️ Máximo de reintentos alcanzado');
            setError('No se pudo procesar el pago después de varios intentos. Por favor, contacta al soporte.');
            setErrorType('verification');
          }
        } else {
          console.error('❌ Error verifying payment:', data.error, data.details);
          
          // Determinar el tipo de error
          if (data.error === 'Checkout not completed') {
            setErrorType('checkout');
            setError('El proceso de pago no se completó. Por favor, intenta nuevamente.');
          } else if (data.error === 'Payment not completed') {
            setErrorType('payment');
            setError('El pago no se completó correctamente. Por favor, verifica tu método de pago e intenta nuevamente.');
          } else {
            setErrorType('verification');
            setError(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
          }
          
          if (retryCount < maxRetries) {
            // Reintentar en caso de error
            console.log('🔄 Reintentando en 3 segundos...');
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPayment();
            }, 3000);
          } else {
            // Mostrar datos básicos en caso de error después de máximo reintentos
            setPurchaseDetails({
              productName: 'Curso comprado',
              amount: 'Error al verificar',
              expiresAt: 'Error al verificar',
              email: 'Error al verificar',
              isProcessed: false,
              error: true
            });
          }
        }
      } catch (error) {
        console.error('❌ Error en verificación:', error);
        setError('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
        setErrorType('verification');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Verificando tu pago...</h2>
          <p className="text-gray-600 mt-2">Por favor, espera un momento.</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">Intento {retryCount + 1}/{maxRetries}</p>
          )}
          {sessionId && (
            <p className="text-xs text-gray-400 mt-2">Session ID: {sessionId.substring(0, 20)}...</p>
          )}
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    const getErrorIcon = () => {
      switch (errorType) {
        case 'checkout':
          return '🛒';
        case 'payment':
          return '💳';
        case 'verification':
          return '⚠️';
        default:
          return '❌';
      }
    };

    const getErrorTitle = () => {
      switch (errorType) {
        case 'checkout':
          return 'Checkout Incompleto';
        case 'payment':
          return 'Error de Pago';
        case 'verification':
          return 'Error de Verificación';
        default:
          return 'Error';
      }
    };

    const getErrorDescription = () => {
      switch (errorType) {
        case 'checkout':
          return 'El proceso de pago no se completó. Esto puede suceder si cerraste la ventana antes de finalizar.';
        case 'payment':
          return 'El pago no se procesó correctamente. Verifica tu método de pago e intenta nuevamente.';
        case 'verification':
          return 'Hubo un problema verificando tu pago. Esto puede ser temporal.';
        default:
          return 'Ocurrió un error inesperado.';
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 text-red-500 mb-4 text-4xl">{getErrorIcon()}</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {getErrorTitle()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {getErrorDescription()}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Detalles del Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {sessionId && (
                      <p className="mt-2">
                        <strong>Session ID:</strong> {sessionId}
                      </p>
                    )}
                    <p className="mt-2">
                      <strong>Intento:</strong> {retryCount + 1}/{maxRetries}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {errorType === 'checkout' && (
                <Link
                  href="/cursos"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Intentar nuevamente
                </Link>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Reintentar verificación
              </button>
              
              <Link
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Pago exitoso!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu compra ha sido procesada correctamente
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Producto:</span>
              <span className="font-medium">{purchaseDetails?.productName}</span>
            </div>
            {purchaseDetails?.hasDiscount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Precio original:</span>
                <span className="text-gray-500 line-through">{purchaseDetails?.originalAmount}</span>
              </div>
            )}
            {purchaseDetails?.hasDiscount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento:</span>
                <span className="font-medium text-green-600">-{purchaseDetails?.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Monto final:</span>
              <span className="font-medium text-lg">{purchaseDetails?.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Acceso hasta:</span>
              <span className="font-medium">{purchaseDetails?.expiresAt}</span>
            </div>
          </div>

          {/* Mensaje especial para pagos gratuitos */}
          {purchaseDetails?.isFreePurchase && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="text-2xl mr-3">🎉</div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Curso 100% GRATIS!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Has usado el cupón GRATIS100. Tu acceso está completamente activado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Acceso activado
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Ya puedes acceder a todo el contenido del curso. 
                    Tu acceso estará disponible durante 1 año.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje para usuario creado automáticamente */}
          {userCreated && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="text-2xl mr-3">👤</div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    ¡Cuenta creada automáticamente!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Hemos creado una cuenta para ti con el email: <strong>{purchaseDetails?.email}</strong>
                    </p>
                    <p className="mt-2">
                      <strong>🔑 Contraseña temporal:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{purchaseDetails?.tempPassword || 'No disponible'}</code>
                    </p>
                                         <p className="mt-2 text-xs text-blue-600">
                       💡 <strong>Consejo:</strong> Usa esta contraseña para hacer login. Puedes cambiarla después en tu perfil.
                     </p>
                     <div className="mt-3">
                       <button
                         onClick={() => {
                           // Redirigir a la página de login con el email pre-llenado
                           window.location.href = `/auth/login?email=${encodeURIComponent(purchaseDetails?.email || '')}`;
                         }}
                         className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                       >
                         🔑 Hacer login ahora
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!purchaseDetails?.isProcessed && retryCount < maxRetries && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Procesando tu acceso...
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Tu pago fue exitoso. Estamos configurando tu acceso al curso.
                      Esto puede tomar unos momentos.
                    </p>
                    <p className="mt-1 text-xs">
                      Intento {retryCount + 1}/{maxRetries}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!purchaseDetails?.isProcessed && retryCount >= maxRetries && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="text-2xl mr-3">⏰</div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Acceso en proceso
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Tu pago fue exitoso. Tu acceso se activará en los próximos minutos.
                      Recibirás un email cuando esté listo.
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 text-blue-800 underline text-sm hover:text-blue-900"
                    >
                      Verificar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isNewUser && purchaseDetails?.isProcessed && !userCreated && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    ¡Bienvenido a Indomath!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Hemos enviado un email a {purchaseDetails.email} con instrucciones
                      para establecer tu contraseña y acceder a tu cuenta.
                    </p>
                    <p className="mt-2">
                      Por favor, revisa tu bandeja de entrada y sigue las instrucciones
                      para comenzar a disfrutar de tu curso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isNewUser && purchaseDetails?.isProcessed && (
            <Link
              href="/cursos"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir a mis cursos
            </Link>
          )}
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>
            Recibirás un email de confirmación con los detalles de tu compra.
          </p>
          <p className="mt-1">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Verificando tu pago...</h2>
          <p className="text-gray-600 mt-2">Por favor, espera un momento.</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 