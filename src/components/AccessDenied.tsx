'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PurchaseButton from './PurchaseButton';
import { useAuthContext } from './AuthProvider';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showPurchaseButton?: boolean;
  productId?: string;
  priceId?: string;
  productName?: string;
  productPrice?: number;
  productType?: 'course' | 'module';
  courseType?: 'CIENCIAS' | 'CCSS';
  contentType?: 'course' | 'module' | 'lesson';
}

export default function AccessDenied({
  title = "Acceso Restringido",
  message = "Este contenido está disponible solo para usuarios que han adquirido el curso.",
  showPurchaseButton = true,
  productId,
  priceId,
  productName,
  productPrice,
  productType = 'course',
  courseType,
  contentType = 'course'
}: AccessDeniedProps) {
  const { user } = useAuthContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {/* Icono de candado */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Información del usuario */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">
                ¿No tienes cuenta? 
              </p>
              <p className="text-blue-600 text-sm">
                Inicia sesión o regístrate para acceder a tus cursos comprados.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-4">
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/auth/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-3 rounded-lg border-2 border-blue-600 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            ) : showPurchaseButton && productId && priceId && productName && productPrice ? (
              <div className="space-y-4">
                <PurchaseButton
                  productId={productId}
                  priceId={priceId}
                  name={productName}
                  price={productPrice}
                  type={productType}
                  courseType={courseType}
                  variant="primary"
                  size="lg"
                  className="w-full max-w-sm mx-auto"
                />
                <p className="text-sm text-gray-500">
                  Al comprar tendrás acceso completo a todo el contenido del {contentType === 'course' ? 'curso' : 'módulo'}.
                </p>
              </div>
            ) : user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium mb-2">
                  Cuenta verificada
                </p>
                <p className="text-yellow-700 text-sm">
                  Tu cuenta está activa, pero no tienes acceso a este contenido. Contacta al soporte si crees que esto es un error.
                </p>
              </div>
            )}

            {/* Enlaces adicionales */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <Link 
                  href="/cursos"
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  Ver todos los cursos
                </Link>
                <Link 
                  href="/contacto"
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  Contactar soporte
                </Link>
                {user && (
                  <Link 
                    href="/perfil"
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Mi perfil
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 