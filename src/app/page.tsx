'use client';
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { useState, useEffect } from 'react'

// Palabras para animar
const ANIMATED_WORDS = ['límite', 'derivada', 'matriz'];

// Parallax custom hook




export default function HomePage() {
  const [currentWord, setCurrentWord] = useState(0);

  // Efecto para cambiar la palabra cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % ANIMATED_WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full font-sans">
      {/* Hero Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative min-h-screen flex items-center px-6 md:px-20 py-20 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
          <Image
            src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/Portada%20principal.png"
            alt="Portada Indomath"
            fill
            className="object-cover"
          />
        </div>
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
            Supera cualquier{' '}
            <motion.span
              key={currentWord}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-blue-300 inline-block"
            >
              {ANIMATED_WORDS[currentWord]}
            </motion.span>
          </h1>
          <p className="mb-8 text-lg sm:text-xl text-white drop-shadow-md max-w-lg">
            Somos Indomath, el portal educativo especializado en la enseñanza de las matemáticas con el método más eficaz. ¡Descubre los materiales y cursos matemáticos!
          </p>
          <Link href="#cursos" className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 font-bold shadow text-lg text-white">
            Quiero entender matemáticas
          </Link>
        </motion.div>
      </motion.section>

      {/* Nuestros cursos */}
      <motion.section id="cursos" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="py-28">
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-12 sm:mb-16 md:mb-20 text-[#0a1633] px-6 md:px-20">Nuestros cursos</motion.h2>
        <div className="flex flex-col md:flex-row w-full relative">
          <motion.div 
            initial={{ opacity: 0, x: -60 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.7 }} 
            className="bg-[#0a1633] text-white p-6 sm:p-8 md:p-12 lg:p-16 shadow-xl flex flex-col justify-between w-full md:w-1/2 relative z-10 min-h-[350px] sm:min-h-[400px]"
          >
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">¿Por qué Indomath?</h3>
              <p className="mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl leading-relaxed">
                Aprende de forma estructurada y comprensiva. Solo en Indomath encontrarás el método que te lleva desde lo más básico hasta lo más avanzado.
              </p>
            </div>
            <Link href="#" className="bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 font-bold text-white w-max text-lg">Ver más</Link>
            
            {/* Piquito que se integra en la otra tarjeta */}
            <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[24px] border-l-[#0a1633] border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent z-20"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 60 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.7, delay: 0.2 }} 
            className="bg-white text-[#0a1633] p-6 sm:p-8 md:p-12 lg:p-16 shadow-xl flex flex-col justify-between w-full md:w-1/2 relative z-5 min-h-[350px] sm:min-h-[400px]"
          >
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Ventajas de nuestros cursos</h3>
              <ul className="list-disc pl-5 space-y-2 sm:space-y-3 text-base sm:text-lg md:text-xl">
                <li>Videos HD y autoevaluaciones</li>
                <li>Material descargable y ejercicios</li>
                <li>Acceso privado y atención personalizada</li>
                <li>Actualizaciones constantes</li>
              </ul>
            </div>
            <Link href="/cursos" className="mt-10 bg-blue-600 hover:bg-blue-700 transition-colors px-8 py-3 font-bold text-white w-max text-lg">Ver cursos</Link>
            
            {/* Piquito que se integra en la otra tarjeta */}
            <div className="hidden md:block absolute -left-6 top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-[24px] border-r-white border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent z-20"></div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="flex justify-center mt-10 px-6 md:px-20">
          <Link href="/cursos" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl hover:from-violet-700 hover:to-blue-600 transition-all text-base sm:text-lg group relative overflow-visible cta-sparkle">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
            ¡Comprar cursos ahora!
            <span className="absolute inset-0 pointer-events-none flex items-center justify-center sparkle-cta" style={{display:'none'}}>
              <svg width="60" height="30" className="animate-sparkle" viewBox="0 0 60 30" fill="none">
                <circle cx="10" cy="15" r="2" fill="#ffe066" />
                <circle cx="30" cy="8" r="1.5" fill="#fff" />
                <circle cx="50" cy="18" r="2.2" fill="#ffd700" />
                <circle cx="20" cy="25" r="1.2" fill="#fffbe7" />
                <circle cx="40" cy="12" r="1.7" fill="#fff" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </motion.section>

      {/* Beneficios */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="py-29 px-6 md:px-20">
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-12 md:mb-14 text-[#0a1633]">Beneficios</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-26 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="bg-[#0a1633] text-white p-6 sm:p-8 flex flex-col items-center shadow rounded-lg sm:col-span-2 md:col-span-1">
            <span className="text-4xl sm:text-5xl mb-3 sm:mb-4">📚</span>
            <h4 className="font-bold text-lg sm:text-xl mb-2">Aprende</h4>
            <p className="text-center text-sm sm:text-base md:text-lg">Utiliza el sentido lógico y conecta los materiales de todas las áreas matemáticas.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="bg-blue-500 text-white p-6 sm:p-8 flex flex-col items-center shadow rounded-lg">
            <span className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</span>
            <h4 className="font-bold text-lg sm:text-xl mb-2">Entiende</h4>
            <p className="text-center text-sm sm:text-base md:text-lg">Usa recursos visuales y prácticos para resolver cualquier tipo de problema.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-blue-200 text-[#0a1633] p-6 sm:p-8 flex flex-col items-center shadow rounded-lg sm:col-span-2 md:col-span-1">
            <span className="text-4xl sm:text-5xl mb-3 sm:mb-4">🏆</span>
            <h4 className="font-bold text-lg sm:text-xl mb-2">Aprueba</h4>
            <p className="text-center text-sm sm:text-base md:text-lg">Llega al examen listo, consigue los mejores resultados en menos tiempo.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonios Slider */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }} className="bg-[#0a1633] py-20 px-6 md:px-20 relative overflow-hidden">
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-6xl font-extrabold text-center mb-14 text-white">Nuestros alumnos</motion.h2>
        <TestimoniosSliderRect />
      </motion.section>

      {/* Nueva sección alterna debajo del slider */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }} className="py-20 px-6 md:px-20 space-y-24">
        {/* Mejora continua */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-4 text-[#0a1633]">Mejora continua</h3>
            <p className="text-lg text-gray-700 mb-4">En Indomath, estamos comprometidos con tu auto-superación y éxito. Mejora constantemente con recursos actualizados y atención personalizada.</p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/3-2.png"
              alt="Engranajes"
              width={320}
              height={320}
              className="object-contain"
            />
          </div>
        </div>
        {/* Videos cortos y eficaces */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-4 text-[#0a1633]">Videos cortos y eficaces</h3>
            <p className="text-lg text-gray-700 mb-4">Explicaciones visuales y directas para que llegues al examen con seguridad. Aprende a tu ritmo con videos de alta calidad.</p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/4-3.png"
              alt="Cámara pro"
              width={320}
              height={320}
              className="object-contain"
            />
          </div>
        </div>
        {/* Nuestro método */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-4 text-[#0a1633]">Nuestro método</h3>
            <p className="text-lg text-gray-700 mb-4">Nuestro método conecta profundamente la lógica y la comprensión matemática, para que entiendas y no solo memorices.</p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/Brand-2.png"
              alt="Cabeza humana pro"
              width={320}
              height={320}
              className="object-contain"
            />
          </div>
        </div>
      </motion.section>

      {/* Redes sociales mejoradas */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7, delay: 0.5 }} 
        className="bg-gradient-to-br from-[#0a1633] via-[#1e2a4a] to-[#2d3a5f] py-24 px-6 md:px-20 relative overflow-hidden"
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Título de la sección */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Únete a nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">comunidad</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Síguenos en nuestras redes sociales para obtener tips matemáticos, ejercicios resueltos y mucho más contenido educativo
            </p>
          </motion.div>

                     {/* Grid de redes sociales */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* YouTube */}
            <motion.a 
              href="https://youtube.com/@indomath" 
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.1 }}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-red-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">YouTube</h3>
                  <p className="text-gray-300 text-sm mt-1">Videos explicativos</p>
                  <p className="text-red-400 font-semibold text-lg mt-2">+50 Ejercicios resueltos</p>
                </div>
              </div>
            </motion.a>

            {/* Instagram */}
            <motion.a 
              href="https://instagram.com/indomath_clases" 
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.2 }}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-pink-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">Instagram</h3>
                  <p className="text-gray-300 text-sm mt-1">Tips y Curiosidades</p>
                  <p className="text-pink-400 font-semibold text-lg mt-2">+3K seguidores</p>
                </div>
              </div>
            </motion.a>

            {/* TikTok */}
            <motion.a 
              href="https://tiktok.com/@indomath" 
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.3 }}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-gray-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-gray-300 transition-colors">TikTok</h3>
                  <p className="text-gray-300 text-sm mt-1">Entretenimiento</p>
                  <p className="text-gray-400 font-semibold text-lg mt-2">+20k vistas</p>
                </div>
              </div>
            </motion.a>

            
          </div>

          
        </div>
      </motion.section>


    </main>
  );
}

const testimonios = [
  {
    img: 'https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/Testimonio%20chica%201.png',
    alt: 'Chica 1',
    nombre: 'Lucía García',
    curso: '2º Bachillerato Ciencias',
    texto: '"Al principio me costaba mucho entender las derivadas y los límites. Con los videos de Indomath pude ver paso a paso cómo se resolvían y ahora hasta disfruto haciendo ejercicios. ¡He pasado de un 5 a un 8 en matemáticas!"',
  },
  {
    img: 'https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/Testimonio%20chico.png',
    alt: 'Chico 2',
    nombre: 'Carlos Martínez',
    curso: '2º Bachillerato CCSS',
    texto: '"Las explicaciones son súper claras y lo mejor es que puedo ver los videos las veces que necesite. La parte de probabilidad que tanto me costaba ahora la entiendo perfectamente. El profesor explica como si estuviera a tu lado."',
  },
  {
    img: 'https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/Testimonio%20chica%202.png',
    alt: 'Chica 2',
    nombre: 'Marta Rodríguez',
    curso: '2º Bachillerato Ciencias',
    texto: '"Gracias a Indomath conseguí un 13 en la EVAU. Las explicaciones son muy completas y los ejercicios son justo del nivel que luego te encuentras en el examen. ¡Totalmente recomendado si quieres sacar buena nota!"',
  },
]

function TestimoniosSliderRect() {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    slideChanged(s) {
      setCurrent(s.track.details.rel)
    },
  });
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-full max-w-5xl h-[400px] md:h-[420px] mx-auto">
        <div ref={sliderRef} className="keen-slider w-full h-full">
          {testimonios.map((t, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="keen-slider__slide relative w-full h-full overflow-hidden shadow-2xl"
              key={idx}
            >
              <Image
                src={t.img}
                alt={t.alt}
                fill
                className="object-cover w-full h-full absolute inset-0 z-0"
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 text-center">{t.nombre}</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow mb-4 text-center">{t.curso}</h3>
                <p className="text-xl md:text-2xl text-white font-semibold text-center leading-snug mb-6 drop-shadow-lg max-w-3xl">
                  {t.texto}
                </p>
                <Link href="/cursos" className="mt-2 px-6 py-3 bg-white/20 border border-white text-white font-bold rounded transition hover:bg-white/40 text-lg shadow-lg">
                  Únete a nuestra comunidad
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Flechas navegación */}
        <button
          aria-label="Anterior"
          className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-indigo-900 rounded-full p-2 shadow-lg hidden md:block"
          onClick={() => instanceRef.current?.prev()}
          style={{ zIndex: 2 }}
        >
          &#8592;
        </button>
        <button
          aria-label="Siguiente"
          className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-indigo-900 rounded-full p-2 shadow-lg hidden md:block"
          onClick={() => instanceRef.current?.next()}
          style={{ zIndex: 2 }}
        >
          &#8594;
        </button>
      </div>
      {/* Dots navegación */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonios.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${current === idx ? 'bg-blue-400' : 'bg-white/40'}`}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            aria-label={`Ir al testimonio ${idx + 1}`}
          />
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="flex justify-center mt-10">
        <Link href="/cursos" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:from-violet-700 hover:to-blue-600 transition-all text-lg group relative overflow-visible cta-sparkle">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
          ¡Quiero comprar cursos!
          <span className="absolute inset-0 pointer-events-none flex items-center justify-center sparkle-cta" style={{display:'none'}}>
            <svg width="60" height="30" className="animate-sparkle" viewBox="0 0 60 30" fill="none">
              <circle cx="10" cy="15" r="2" fill="#ffe066" />
              <circle cx="30" cy="8" r="1.5" fill="#fff" />
              <circle cx="50" cy="18" r="2.2" fill="#ffd700" />
              <circle cx="20" cy="25" r="1.2" fill="#fffbe7" />
              <circle cx="40" cy="12" r="1.7" fill="#fff" />
            </svg>
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

<script dangerouslySetInnerHTML={{__html:`
  document.querySelectorAll('.cta-sparkle').forEach(btn => {
    btn.addEventListener('click', function() {
      const spark = btn.querySelector('.sparkle-cta');
      if (spark) {
        spark.style.display = 'flex';
        setTimeout(() => { spark.style.display = 'none'; }, 700);
      }
    });
  });
`}} />
