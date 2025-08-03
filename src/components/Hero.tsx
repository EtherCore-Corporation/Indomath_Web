"use client";
// Instala framer-motion si no lo tienes: npm install framer-motion
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Hero() {
  // Parallax para blobs y ondas
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref });
  const blob1Y = useTransform(scrollY, [0, 300], [0, 60]);
  const blob2Y = useTransform(scrollY, [0, 300], [0, -40]);
  const waveY = useTransform(scrollY, [0, 300], [0, 30]);

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[420px] flex flex-col items-center justify-center bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-600 py-24 mb-16">
      {/* Blobs decorativos con parallax */}
      <motion.svg style={{ y: blob1Y }} className="absolute left-[-120px] top-[-80px] w-[340px] h-[340px] z-0 opacity-60" viewBox="0 0 400 400" fill="none">
        <path d="M320,80Q360,160,320,240Q280,320,200,320Q120,320,80,240Q40,160,80,80Q120,0,200,40Q280,80,320,80Z" fill="#a78bfa" />
      </motion.svg>
      <motion.svg style={{ y: blob2Y }} className="absolute right-[-100px] bottom-[-80px] w-[260px] h-[260px] z-0 opacity-40" viewBox="0 0 300 300" fill="none">
        <path d="M220,60Q260,150,180,200Q100,250,60,170Q20,90,100,60Q180,30,220,60Z" fill="#38bdf8" />
      </motion.svg>
      {/* Onda inferior con parallax */}
      <motion.svg style={{ y: waveY }} className="absolute bottom-0 left-0 w-full h-[120px] z-0" viewBox="0 0 1440 320" fill="none">
        <path fill="#fff" fillOpacity="1" d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,133.3C1120,107,1280,85,1360,74.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
      </motion.svg>
      {/* Partículas/efecto abstracto */}
      {/* <svg className="absolute inset-0 w-full h-full opacity-20 z-0" viewBox="0 0 800 400" fill="none">
        <circle cx="200" cy="200" r="180" fill="url(#paint0_radial)" />
        <circle cx="600" cy="100" r="120" fill="url(#paint1_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(180)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(600 100) scale(120)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg> */}
      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-4">
          Nuestros cursos
        </h1>
        <p className="text-lg md:text-2xl text-indigo-100 text-center max-w-2xl">
          Descubre los cursos y bloques de 2º de Bachillerato más completos y modernos. Elige tu camino: Ciencias o Ciencias Sociales.
        </p>
      </motion.div>
    </section>
  );
} 