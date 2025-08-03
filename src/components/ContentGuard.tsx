'use client';

import { useEffect, useState } from 'react';

import { useAccess } from '@/lib/hooks/useAccess';
import { useAuthContext } from './AuthProvider';
import PurchaseButton from './PurchaseButton';

interface ContentGuardProps {
  children: React.ReactNode;
  contentType: string;
  contentId: string;
  courseType?: string;
  fallback?: React.ReactNode;
  showPurchaseButton?: boolean;
  productId?: string;
  priceId?: string;
  productName?: string;
  productPrice?: number;
}

export default function ContentGuard({
  contentType,
  contentId,
  courseType,
  children,
  fallback,
  showPurchaseButton = true,
  productId,
  priceId,
  productName,
  productPrice
}: ContentGuardProps) {
  const { checkAccess, isLoading } = useAccess();
  const { user, loading: authLoading } = useAuthContext();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserAccess = async () => {
      // Si no hay usuario, denegar acceso
      if (!user) {
        setHasAccess(false);
        return;
      }

      // Verificar acceso al contenido
      const accessInfo = await checkAccess(contentType, contentId, courseType, user);
      setHasAccess(accessInfo.hasAccess);
    };

    // Solo ejecutar si el auth no está cargando
    if (!authLoading) {
      checkUserAccess();
    }
  }, [contentType, contentId, courseType, checkAccess, user, authLoading]);

  // Mostrar loading mientras se verifica el acceso
  if (isLoading || authLoading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Si tiene acceso, mostrar el contenido
  if (hasAccess) {
    return (
      <>
        {children}
      </>
    );
  }

  // Si no tiene acceso, mostrar fallback o componente por defecto
  if (fallback) {
    return <>{fallback}</>;
  }

  // Componente por defecto de acceso denegado
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
      <p className="text-gray-600 mb-6">
        {!user 
          ? 'Inicia sesión para acceder a este contenido.'
          : 'Este contenido requiere una compra para acceder.'
        }
      </p>

      {!user ? (
        <div className="space-x-4">
          <a
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </a>
          <a
            href="/auth/register"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Registrarse
          </a>
        </div>
      ) : showPurchaseButton && productId && priceId && productName && productPrice ? (
        <PurchaseButton
          productId={productId}
          priceId={priceId}
          name={productName}
          price={productPrice}
          type="course"
          variant="primary"
          size="lg"
        />
      ) : (
        <p className="text-sm text-gray-500">
          Contacta al soporte si crees que esto es un error.
        </p>
      )}
    </div>
  );
} 