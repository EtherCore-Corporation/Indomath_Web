'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// Componente del método interactivo
function MetodoInteractivo() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Función para calcular posiciones del pentágono matemáticamente
  const calculatePentagonPosition = (index: number, radius: number = 320) => {
    // Ajustamos para que el primer punto esté arriba y sea un pentágono regular
    const angleInDegrees = -90 + (index * (360 / 5));
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    
    // Calculamos la posición relativa al centro
    const x = Math.cos(angleInRadians) * radius;
    const y = Math.sin(angleInRadians) * radius;
    
    // Calculamos la posición absoluta
    const centerX = 350;
    const centerY = 350;
    
    return {
      x: x + centerX,
      y: y + centerY,
      angle: angleInDegrees
    };
  };

  const steps = [
    {
      id: 1,
      name: "Ask",
      displayName: "Preguntar",
      icon: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
      content: "Preguntamos al alumno como entiende el concepto.",
      color: "#3B82F6",
      borderColor: "#60A5FA",
      position: calculatePentagonPosition(0)
    },
    {
      id: 2,
      name: "Rebuild",
      displayName: "Reconstruir",
      icon: "M20 7h-7L10 4H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z",
      content: "Se crea una definición precisa basada en las ideas correctas del alumno.",
      color: "#8B5CF6",
      borderColor: "#A78BFA",
      position: calculatePentagonPosition(1)
    },
    {
      id: 3,
      name: "Particularize",
      displayName: "Particularizar",
      icon: "M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7l2.5-1.4zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14l-2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2z",
      content: "Comenzar desde casos específicos para identificar similitudes y desarrollar el concepto general.",
      color: "#6366F1",
      borderColor: "#818CF8",
      position: calculatePentagonPosition(2)
    },
    {
      id: 4,
      name: "Generalize",
      displayName: "Generalizar",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 20.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
      content: "Los estudiantes entienden cómo aplicar el concepto en varios problemas y situaciones.",
      color: "#10B981",
      borderColor: "#34D399",
      position: calculatePentagonPosition(3)
    },
    {
      id: 5,
      name: "Master",
      displayName: "Dominar",
      icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
      content: "Se plantean ejercicios para consolidar y aplicar los conocimientos aprendidos.",
      color: "#EF4444",
      borderColor: "#F87171",
      position: calculatePentagonPosition(4)
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }} 
      transition={{ duration: 0.7 }}
      className="py-20 px-6 md:px-20 bg-[#0F172A] relative overflow-hidden"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center text-white mb-16"
        >
          Nuestro método
        </motion.h2>
        
        <div className="relative h-[800px] flex items-center justify-center">
          {/* Contenedor del pentágono */}
          <div className="relative w-[700px] h-[700px]">
            {/* Líneas conectoras */}
            <svg className="absolute inset-0 w-full h-full">
              {steps.map((step, index) => {
                const nextIndex = (index + 1) % steps.length;
                const start = step.position;
                const end = steps[nextIndex].position;
                const centerX = 350;
                const centerY = 350;
                return (
                  <g key={`line-${index}`}>
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="#4F46E5"
                      strokeWidth="2"
                    />
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                      x1={centerX}
                      y1={centerY}
                      x2={start.x}
                      y2={start.y}
                      stroke="#4F46E5"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}
            </svg>

            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3
                }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1
                }} 
                viewport={{ once: true }} 
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3 + index * 0.2,
                  type: "spring",
                  damping: 12
                }}
                className="absolute"
                style={{
                  top: `${step.position.y - 30}px`,
                  left: `${step.position.x - 55}px`, // Movemos 28px a la izquierda (la mitad del ancho de la tarjeta)
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.button
                  onClick={() => setActiveStep(step.id)}
                  whileHover={{ scale: 1.1 }}
                  className="w-28 h-28 rounded-xl flex flex-col items-center justify-center relative group"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: `0 0 20px ${step.color}40`,
                    border: `2px solid ${step.borderColor}`
                  }}
                >
                  <motion.div 
                    className="w-8 h-8 mb-2 text-white"
                    animate={{ rotate: activeStep === step.id ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d={step.icon} />
                    </svg>
                  </motion.div>
                  <span className="text-sm font-semibold text-white text-center leading-tight">
                    {step.id}. {step.displayName}
                  </span>
                </motion.button>
              </motion.div>
            ))}

            {/* Contenido central */}
            <AnimatePresence mode="wait">
              {activeStep && (
                <motion.div 
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 z-20"
                  style={{
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div 
                    className="bg-[#1E293B] backdrop-blur-xl rounded-xl p-6 border shadow-2xl"
                    style={{
                      borderColor: steps.find(s => s.id === activeStep)?.borderColor
                    }}
                  >
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-bold text-white mb-3"
                      style={{
                        color: steps.find(s => s.id === activeStep)?.borderColor
                      }}
                    >
                      {activeStep}. {steps.find(s => s.id === activeStep)?.displayName}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-300 leading-relaxed"
                    >
                      {steps.find(s => s.id === activeStep)?.content}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mascota */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="absolute right-0 top-1/2 transform -translate-y-1/4 translate-x-1/4 hidden lg:block"
          >
            <Image
              src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/MORPH-4.png"
              alt="Mascota Indomath"
              width={300}
              height={300}
              className="drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </motion.section>
  );
}

export default function NosotrosPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Bienvenidos a Indomath */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }}
        className="py-20 px-6 md:px-20"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0a1633] mb-8">
            Bienvenidos a Indomath
          </h1>
          <div className="max-w-10xl mx-auto">
            <div className="aspect-video relative">
              <iframe
                src="https://iframe.mediadelivery.net/embed/394900/756d060f-5b7e-4a15-b288-67ee64e059a3?autoplay=true"
                loading="lazy"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  width: '100%'
                }}
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen={true}
                className="w-full h-full rounded-2xl"
              ></iframe>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Nuestro método */}
      <MetodoInteractivo />
      

      {/* Cosas que nos hacen únicos */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7 }}
        className="py-20 px-6 md:px-20"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0a1633] mb-4">
            Cosas que nos hacen <span className="underline decoration-blue-500">únicos</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            {/* Máxima organización */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0a1633] mb-2">Máxima organización</h3>
                <p className="text-gray-600">
                  Nuestros cursos están estructurados para optimizar tu aprendizaje paso a paso, construyendo una comprensión sólida de los conceptos.
                </p>
              </div>
            </motion.div>

            {/* Videos cortos y eficaces */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0a1633] mb-2">Videos cortos y eficaces</h3>
                <p className="text-gray-600">
                  Videos diseñados para mantener tu atención y maximizar el aprendizaje en el menor tiempo posible.
                </p>
              </div>
            </motion.div>

            {/* Cursos de la mejor calidad */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0a1633] mb-2">Cursos de la mejor calidad</h3>
                <p className="text-gray-600">
                  Los mejores profesores de la web. Nuestros expertos en matemáticas usan métodos didácticos únicos que garantizan un aprendizaje sólido y duradero.
                </p>
              </div>
            </motion.div>

            {/* Resolución de dudas */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0a1633] mb-2">Resolución de dudas</h3>
                <p className="text-gray-600">
                  Apoyo en tiempo real. Nuestro equipo de profesores expertos está disponible para resolver cualquier tipo de duda matemática.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Nuestro equipo */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7 }}
        className="py-20 px-6 md:px-20"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#0a1633] mb-16">
            Nuestro equipo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Miembro 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-[#013220] rounded-2xl p-8 text-center text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <Image
                  src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/MORPH-5.png"
                  alt="Profesor Principal"
                  width={150}
                  height={150}
                  className="mx-auto mb-4 drop-shadow-lg"
                />
                <h3 className="text-2xl font-bold mb-2">Ibai San Millan</h3>
                <p className="text-blue-200 mb-4">Fundador</p>
                <p className="text-sm text-blue-100">
Licenciado en Ciencias de la Computación y Director de Marketing                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </motion.div>

            {/* Miembro 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-[#2d4a87] rounded-2xl p-8 text-center text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <Image
                  src="https://iuntmgotfksbmgzwnwsw.supabase.co/storage/v1/object/public/images/MORPH-4.png"
                  alt="Profesora Asociada"
                  width={150}
                  height={150}
                  className="mx-auto mb-4 drop-shadow-lg"
                />
                <h3 className="text-2xl font-bold mb-2">Alfonso Andres</h3>
                <p className="text-blue-200 mb-4">Profesor & Fundador</p>
                <p className="text-sm text-blue-100">
                Matemático con más de 10 años de experiencia enseñando. Creador del método Indomath que ha ayudado a miles de estudiantes.                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-br from-[#0a1633] to-[#2d4a87] py-20 px-6 md:px-20"
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para dominar las matemáticas?
          </h2>
          <p className="text-xl mb-8 text-blue-200">
            Únete a miles de estudiantes que ya han transformado su relación con las matemáticas
          </p>
          <Link 
            href="/cursos"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-lg"
          >
            Ver nuestros cursos
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </Link>
        </div>
      </motion.section>
    </main>
  );
} 