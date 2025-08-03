'use client';

import { useState } from 'react';
import { usePayment } from '@/lib/hooks/usePayment';

interface PurchaseButtonProps {
  productId: string;
  priceId: string;
  name: string;
  price: number;
  type: 'course' | 'module';
  courseType?: 'CIENCIAS' | 'CCSS';
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function PurchaseButton({
  productId,
  priceId,
  name,
  price,
  type,
  courseType,
  className = '',
  variant = 'primary',
  size = 'md'
}: PurchaseButtonProps) {
  const { createCheckoutSession, isLoading, error } = usePayment();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponField, setShowCouponField] = useState(false);

  const handlePurchase = async () => {
    await createCheckoutSession({
      productId,
      priceId,
      name,
      price,
      type,
      courseType,
      couponCode: couponCode.trim() || undefined
    });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };



  return (
    <div className="space-y-3">
      {/* Campo de cupón */}
      {showCouponField && (
        <div className="space-y-2">
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
            Código de cupón
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Ej: ESTUDIANTE20"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setShowCouponField(false);
                setCouponCode('');
              }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
          {couponCode && (
            <p className="text-xs text-green-600">
              ✓ Cupón &quot;{couponCode}&quot; será aplicado en el checkout
            </p>
          )}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className={`
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${className}
          font-medium rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          <span>Comprar ya</span>
        )}
      </button>

      {!showCouponField && (
        <button
          type="button"
          onClick={() => setShowCouponField(true)}
          className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors text-center"
        >
          ¿Tienes un código de cupón?
        </button>
      )}
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        Acceso por 1 año • Pago único • Usuario automático
      </div>
    </div>
  );
} 