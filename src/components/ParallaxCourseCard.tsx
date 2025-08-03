"use client";
import { useState } from 'react';

import Image from 'next/image';
import { ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import Tilt from 'react-parallax-tilt';
import PurchaseButton from './PurchaseButton';

interface ParallaxCourseCardProps {
  title: string;
  img: string;
  price: number;
  description?: string;
  area: 'ciencias' | 'ccss';
  badge?: string;
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

export default function ParallaxCourseCard({ title, img, price, description, area, badge }: ParallaxCourseCardProps) {

  const [open, setOpen] = useState(false);

  // Obtener información del producto Stripe
  const stripeProduct = STRIPE_MODULES[area][title as keyof typeof STRIPE_MODULES[typeof area]];

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.10} className="w-full">
      <div className="relative rounded-2xl shadow-xl overflow-hidden group min-h-[340px] flex flex-col p-0">
        {/* Precio tipo post-it */}
        <span className="absolute top-4 left-4 bg-yellow-300 text-gray-900 text-base font-bold px-4 py-1 rounded-lg shadow-lg z-30 border-2 border-yellow-400 rotate-[-6deg]">
          {price.toFixed(2)} €
        </span>
        {/* Imagen ocupa la mitad superior */}
        <div className="w-full h-48 md:h-56 relative">
          <Image src={img} alt={title} fill className="object-cover rounded-t-2xl" />
        </div>
        {/* Descripción y botón en la mitad inferior con fondo translúcido para legibilidad */}
        <div className="relative z-20 flex flex-col items-center justify-between w-full flex-1 px-6 py-6 text-center bg-white/70 backdrop-blur-md rounded-b-2xl">
          {badge && (
            <span className="mb-2 bg-gradient-to-r from-violet-500 to-blue-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-30">
              {badge}
            </span>
          )}
          {/* El título grande se elimina */}
          {/* <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-white drop-shadow-xl">{title}</h2> */}
          {description && <p className="text-base font-semibold text-gray-900 mb-2 drop-shadow-lg leading-snug">{description}</p>}
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
              size="lg"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:from-violet-600 hover:to-blue-600 transition-all text-lg group"
            />
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:scale-105 hover:from-violet-600 hover:to-blue-600 transition-all text-lg group">
                  <ShoppingCartIcon className="w-6 h-6" /> Comprar
                </button>
              </DialogTrigger>
              <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center relative">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mb-2" />
                  <DialogTitle className="text-2xl font-bold mb-2 text-gray-900 text-center">¡Módulo añadido al carrito!</DialogTitle>
                  <DialogDescription className="text-gray-600 mb-4 text-center">Has seleccionado <b>{title}</b> por <b>{price.toFixed(2)} €</b>.</DialogDescription>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold shadow hover:from-violet-700 hover:to-blue-600 transition-all"
                  >
                    Seguir explorando
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Tilt>
  );
} 