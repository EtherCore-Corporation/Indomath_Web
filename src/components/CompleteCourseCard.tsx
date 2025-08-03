"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCartIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import PurchaseButton from './PurchaseButton';

interface CompleteCourseCardProps {
  title: string;
  img: string;
  price: number;
  badge?: string;
  area: 'ciencias' | 'ccss';
  hasAccess?: boolean;
}

// Mapeo de productos Stripe para los cursos completos
const STRIPE_PRODUCTS = {
  ciencias: {
    productId: 'prod_SZ30zG3uAmx1wI',
    priceId: 'price_1Rduu0Ghu0JB2Q77QqjlxuhN',
    price: 4999, // 49.99€ en centavos
    name: 'Curso CIENCIAS Completo',
    type: 'course' as const,
    courseType: 'CIENCIAS' as const
  },
  ccss: {
    productId: 'prod_SZ30I1y3Hn296F',
    priceId: 'price_1Rduu1Ghu0JB2Q77lYGnZPvE',
    price: 4999, // 49.99€ en centavos
    name: 'Curso CCSS Completo',
    type: 'course' as const,
    courseType: 'CCSS' as const
  }
};

function launchConfetti(ref: React.RefObject<HTMLDivElement>) {
  if (!ref.current) return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.pointerEvents = 'none';
  canvas.width = ref.current.offsetWidth;
  canvas.height = ref.current.offsetHeight;
  ref.current.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const colors = ['#ffe066', '#38bdf8', '#a78bfa', '#06b6d4', '#f87171', '#facc15'];
  const particles = Array.from({ length: 32 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: Math.random() * 6 + 4,
    c: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * -8 - 4,
    g: 0.35 + Math.random() * 0.15,
    a: 1,
  }));
  let frame = 0;
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.c;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.a -= 0.018;
    });
    frame++;
    if (frame < 60) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

export default function CompleteCourseCard({ title, img, price, badge, area, hasAccess = false }: CompleteCourseCardProps) {
  const [open, setOpen] = useState(false);
  const [spark, setSpark] = useState(false);
  const sparkTimeout = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Obtener información del producto Stripe
  const stripeProduct = STRIPE_PRODUCTS[area];

  function handleBuyClick() {
    if (!spark) {
      setSpark(true);
      setOpen(true);
      launchConfetti(cardRef as React.RefObject<HTMLDivElement>);
      if (sparkTimeout.current) clearTimeout(sparkTimeout.current);
      sparkTimeout.current = setTimeout(() => setSpark(false), 700);
    }
  }

  useEffect(() => {
    return () => {
      if (sparkTimeout.current) clearTimeout(sparkTimeout.current);
    };
  }, []);

  return (
    <>
      <motion.div
        ref={cardRef}
        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        className="relative bg-white/30 backdrop-blur-lg border border-violet-300/40 rounded-2xl shadow-xl flex flex-col transition-all duration-300 group overflow-hidden p-0"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Imagen de fondo */}
        <Image src={img} alt={title} fill className="object-cover w-full h-full absolute inset-0 z-0" />
        {/* Overlay para oscurecer ligeramente la parte inferior y mejorar la legibilidad de los botones */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Precio tipo post-it con descuento */}
        <div className="absolute top-4 left-4 bg-yellow-300 text-gray-900 text-sm font-bold px-3 py-2 rounded-lg shadow-lg z-20 border-2 border-yellow-400 rotate-[-6deg]">
          <div className="text-xs text-gray-600 line-through">99.99 €</div>
          <div className="text-base text-gray-900">{price.toFixed(2)} €</div>
        </div>
        {/* Badge */}
        {badge && (
          <span className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">
            {badge}
          </span>
        )}
        {/* Botones sobre la imagen, en la parte inferior */}
        <div className="relative z-20 w-full flex flex-col items-center gap-3 px-6 pb-6 mt-auto">
          <div className="w-full flex flex-col md:flex-row gap-3 justify-center">
            {hasAccess ? (
              // Si el usuario tiene acceso, mostrar solo el botón de acceder
              <Link
                href={`/cursos/${area}`}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:from-green-700 hover:to-emerald-600 transition-all text-lg backdrop-blur-md bg-opacity-80 min-w-[160px]"
              >
                <CheckCircleIcon className="w-5 h-5" /> Acceder al curso
              </Link>
            ) : (
              // Si el usuario no tiene acceso, mostrar botones de compra y vista previa
              <>
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
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500/90 text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:from-violet-700 hover:to-blue-600 transition-all text-lg backdrop-blur-md bg-opacity-80 min-w-[140px]"
                  />
                ) : (
                  <button
                    onClick={handleBuyClick}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500/90 text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:from-violet-700 hover:to-blue-600 transition-all text-lg backdrop-blur-md bg-opacity-80 min-w-[140px]"
                  >
                    <ShoppingCartIcon className="w-5 h-5" /> Comprar ya
                  </button>
                )}
                <Link
                  href={`/cursos/${area}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/80 text-violet-700 font-bold px-6 py-3 rounded-xl shadow-xl hover:bg-white/90 transition-all text-lg backdrop-blur-md min-w-[120px]"
                >
                  <EyeIcon className="w-5 h-5" /> Ver curso
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
      {/* Modal fuera de la tarjeta para evitar bugs de hover/focus */}
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
              <h3 className="text-2xl font-bold mb-2 text-gray-900 text-center">¡Curso añadido al carrito!</h3>
              <p className="text-gray-600 mb-4 text-center">Has seleccionado <b>{title}</b> por <b>49.99 €</b>.</p>
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