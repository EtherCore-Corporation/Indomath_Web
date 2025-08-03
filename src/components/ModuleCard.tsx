"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import PurchaseButton from './PurchaseButton';

interface ModuleCardProps {
  title: string;
  img: string;
  price: number;
  description?: string;
  area: 'ciencias' | 'ccss';
}

// Mapeo de productos Stripe para los módulos
const STRIPE_MODULES = {
  ciencias: {
    'ÁLGEBRA Y MATRICES': {
      productId: 'prod_SZ30p6YidW9NY3',
      priceId: 'price_1Rduu1Ghu0JB2Q77HHFllAII',
      price: 1999, // 19.99€ en centavos
      name: 'ALGEBRA Y MATRICES - CIENCIAS',
      type: 'module' as const,
      courseType: 'CIENCIAS' as const
    },
    'GEOMETRÍA': {
      productId: 'prod_SZ30Y65s7YLY6j',
      priceId: 'price_1Rduu2Ghu0JB2Q77yL4JsOUf',
      price: 1999, // 19.99€ en centavos
      name: 'GEOMETRIA - CIENCIAS',
      type: 'module' as const,
      courseType: 'CIENCIAS' as const
    },
    'ANÁLISIS': {
      productId: 'prod_SZ30PKY53NKvgb',
      priceId: 'price_1Rduu3Ghu0JB2Q77H9xnpsn9',
      price: 1999, // 19.99€ en centavos
      name: 'ANALISIS - CIENCIAS',
      type: 'module' as const,
      courseType: 'CIENCIAS' as const
    }
  },
  ccss: {
    'ÁLGEBRA Y MATRICES': {
      productId: 'prod_SZ30tv7L9OX0sj',
      priceId: 'price_1Rduu3Ghu0JB2Q77ury66d4C',
      price: 1999, // 19.99€ en centavos
      name: 'ALGEBRA Y MATRICES - CCSS',
      type: 'module' as const,
      courseType: 'CCSS' as const
    },
    'ANÁLISIS': {
      productId: 'prod_SZ30S9F1bqbFkc',
      priceId: 'price_1Rduu4Ghu0JB2Q77SngbBHHO',
      price: 1999, // 19.99€ en centavos
      name: 'ANALISIS - CCSS',
      type: 'module' as const,
      courseType: 'CCSS' as const
    },
    'ESTADÍSTICA Y PROBABILIDAD': {
      productId: 'prod_SZ30tWoLlp5JXe',
      priceId: 'price_1Rduu4Ghu0JB2Q77LNU255F3',
      price: 1999, // 19.99€ en centavos
      name: 'ESTADISTICA Y PROBABILIDAD - CCSS',
      type: 'module' as const,
      courseType: 'CCSS' as const
    }
  }
};

export default function ModuleCard({ title, img, price, description, area }: ModuleCardProps) {
  const [open, setOpen] = useState(false);
  const grad = area === 'ciencias'
    ? 'from-blue-500 via-violet-500 to-indigo-600'
    : 'from-green-500 via-emerald-500 to-teal-400';

  // Obtener información del producto Stripe
  const stripeProduct = STRIPE_MODULES[area][title as keyof typeof STRIPE_MODULES[typeof area]];

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18)' }}
        className={`relative bg-white/30 backdrop-blur-lg border rounded-2xl shadow-xl flex flex-col transition-all duration-300 group overflow-hidden border-${area === 'ciencias' ? 'blue' : 'green'}-300/40 p-0`}
      >
        {/* Precio tipo post-it */}
        <span className="absolute top-4 left-4 bg-yellow-300 text-gray-900 text-base font-bold px-4 py-1 rounded-lg shadow-lg z-20 border-2 border-yellow-400 rotate-[-6deg]">
          {price.toFixed(2)} €
        </span>
        {/* Imagen ocupa la mitad superior */}
        <div className="w-full h-44 md:h-52 relative">
          <Image src={img} alt={title} fill className="object-cover rounded-t-2xl" />
        </div>
        {/* Descripción y botón en la mitad inferior */}
        <div className="flex flex-col items-center justify-between flex-1 p-6 pt-4">
          {/* El título se elimina */}
          {/* <h4 className="text-lg font-bold text-gray-900 mb-1 text-center drop-shadow-sm">{title}</h4> */}
          <p className="text-sm text-gray-500 mb-2 text-center">{description}</p>
          <div className="flex-1" />
          {stripeProduct ? (
            <PurchaseButton
              productId={stripeProduct.productId}
              priceId={stripeProduct.priceId}
              name={stripeProduct.name}
              price={stripeProduct.price}
              type={stripeProduct.type}
              courseType={stripeProduct.courseType}
              variant="primary"
              size="md"
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${grad} text-white font-bold px-5 py-2 rounded-lg shadow hover:opacity-90 transition-all text-base group`}
            />
          ) : (
            <button
              onClick={() => setOpen(true)}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${grad} text-white font-bold px-5 py-2 rounded-lg shadow hover:opacity-90 transition-all text-base group`}
            >
              <ShoppingCartIcon className="w-5 h-5" /> Comprar
            </button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center relative"
            >
              <CheckCircleIcon className="w-12 h-12 text-green-500 mb-2" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900 text-center">¡Módulo añadido al carrito!</h3>
              <p className="text-gray-600 mb-4 text-center">Has seleccionado <b>{title}</b> por <b>{price.toFixed(2)} €</b>.</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold shadow hover:from-violet-700 hover:to-blue-600 transition-all"
              >
                Seguir explorando
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 