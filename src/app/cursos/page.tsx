"use client";
import Link from 'next/link'

import ParallaxCourseCard from '@/components/ParallaxCourseCard';
import CompleteCourseCard from '@/components/CompleteCourseCard';
import { motion } from 'framer-motion';

import { useAuthContext } from '@/components/AuthProvider';
import { useAccess } from '@/lib/hooks/useAccess';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const cursos = [
  {
    area: 'ciencias',
    completo: {
      nombre: '2 Bachillerato Ciencias',
      img: 'https://indomath.es/wp-content/uploads/2023/09/1-2.png',
      precio: 49.99,
      badge: 'Recomendado',
    },
    modulos: [
      {
        nombre: 'ÁLGEBRA Y MATRICES',
        img: 'https://indomath.es/wp-content/uploads/2023/09/2-2.png',
        precio: 39.99,
        descripcion: 'Bloque 1 Álgebra y Matrices 2º Bach (Ciencias)',
      },
      {
        nombre: 'GEOMETRÍA',
        img: 'https://indomath.es/wp-content/uploads/2023/09/3-2.png',
        precio: 39.99,
        descripcion: 'Bloque 2 Geometría 2º Bach (Ciencias)',
      },
      {
        nombre: 'ANÁLISIS',
        img: 'https://indomath.es/wp-content/uploads/2023/09/4-2.png',
        precio: 39.99,
        descripcion: 'Bloque 3 Análisis 2º Bach (Ciencias)',
      },
    ],
  },
  {
    area: 'ccss',
    completo: {
      nombre: '2 Bachillerato C.C.S.S.',
      img: 'https://indomath.es/wp-content/uploads/2025/05/1.png',
      precio: 49.99,
      badge: 'Popular',
    },
    modulos: [
      {
        nombre: 'ÁLGEBRA Y MATRICES',
        img: 'https://indomath.es/wp-content/uploads/2025/05/2.png',
        precio: 39.99,
        descripcion: 'Bloque 1 Álgebra y Matrices 2º Bach (Ciencias Sociales)',
      },
      {
        nombre: 'ANÁLISIS',
        img: 'https://indomath.es/wp-content/uploads/2025/05/3.png',
        precio: 39.99,
        descripcion: 'Bloque 2 Análisis 2º Bach (Ciencias Sociales)',
      },
      {
        nombre: 'ESTADÍSTICA Y PROBABILIDAD',
        img: 'https://indomath.es/wp-content/uploads/2025/05/4.png',
        precio: 39.99,
        descripcion: 'Bloque 3 Estadística y Probabilidad 2º Bach (Ciencias Sociales)',
      },
    ],
  },
];

interface DatabaseCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  level: string;
  duration: string;
}

interface UserCourseAccess {
  hasAccess: boolean;
  expiresAt: string | null;
}

export default function CursosPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { checkAccess } = useAccess();
  const [dbCourses, setDbCourses] = useState<DatabaseCourse[]>([]);
  const [userAccess, setUserAccess] = useState<Record<string, UserCourseAccess>>({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Cargar cursos desde la base de datos
  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, slug, title, description, image_url, price, level, duration')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }

        console.log('📚 Cursos cargados:', data);
        setDbCourses(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Verificar acceso del usuario a cada curso
  useEffect(() => {
    async function checkUserAccess() {
      if (!user || dbCourses.length === 0) {
        console.log('⚠️ No user or no courses, skipping access check');
        setUserAccess({});
        return;
      }

      console.log('🔍 Checking access for user:', user.email);
      console.log('📚 Courses to check:', dbCourses.map(c => ({ slug: c.slug, id: c.id })));

      const accessChecks = await Promise.all(
        dbCourses.map(async (course) => {
          const courseType = course.slug === 'ciencias' ? 'CIENCIAS' : 'CCSS';
          console.log(`🔍 Checking access for course: ${course.slug} (${courseType})`);
          
          const accessInfo = await checkAccess('course', course.slug, courseType, user);
          
          console.log(`✅ Access result for ${course.slug}:`, accessInfo);
          
          return {
            [course.slug]: {
              hasAccess: accessInfo.hasAccess,
              expiresAt: accessInfo.expiresAt
            }
          };
        })
      );

      const accessMap = accessChecks.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      console.log('🎯 Final access map:', accessMap);
      setUserAccess(accessMap);
    }

    if (!authLoading) {
      checkUserAccess();
    }
  }, [user?.id, dbCourses.length, authLoading, checkAccess, dbCourses, user]);

  // Función para forzar verificación de acceso
  const forceAccessCheck = async () => {
    if (!user || dbCourses.length === 0) {
      setDebugInfo('No user or no courses');
      return;
    }

    setDebugInfo('Verificando acceso...');
    console.log('🔄 Forzando verificación de acceso...');

    const accessChecks = await Promise.all(
      dbCourses.map(async (course) => {
        const courseType = course.slug === 'ciencias' ? 'CIENCIAS' : 'CCSS';
        console.log(`🔍 Forcing access check for course: ${course.slug} (${courseType})`);
        
                  const accessInfo = await checkAccess('course', course.slug, courseType, user);
        
        console.log(`✅ Forced access result for ${course.slug}:`, accessInfo);
        
        return {
          [course.slug]: {
            hasAccess: accessInfo.hasAccess,
            expiresAt: accessInfo.expiresAt
          }
        };
      })
    );

    const accessMap = accessChecks.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    console.log('🎯 Forced access map:', accessMap);
    setUserAccess(accessMap);
    setDebugInfo(`Verificación completada: ${JSON.stringify(accessMap, null, 2)}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1633] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative min-h-screen overflow-hidden">
        
        {/* Hero integrado al flujo, sin fondo ni bloque separado */}
        <h1 className="relative z-10 text-6xl md:text-6xl font-extrabold text-gray-900 drop-shadow-lg text-center mt-20 mb-4">
          {user ? 'Mis Cursos' : 'Nuestros Cursos'}
        </h1>
        
        <p className="relative z-10 text-lg md:text-2xl text-gray-600 text-center max-w-2xl mx-auto mb-20 pb-4">
          {user 
            ? 'Accede a tus cursos comprados y continúa tu aprendizaje'
            : 'Descubre los cursos y bloques de 2º de Bachillerato más completos y modernos. Elige tu camino: Ciencias o Ciencias Sociales.'
          }
        </p>

        {/* Debug info para desarrollo */}
        {user && (
          <div className="relative z-10 max-w-4xl mx-auto mb-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">🔧 Debug Info</h3>
              <button
                onClick={forceAccessCheck}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Forzar Verificación
              </button>
            </div>
            <div className="text-xs text-gray-300">
              <div>Usuario: {user.email}</div>
            </div>
            {debugInfo && (
              <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-green-300 font-mono overflow-auto max-h-32">
                {debugInfo}
              </div>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
          
          {/* Si el usuario no está autenticado, mostrar vista de invitado */}
          {!user && (
            <>
              {/* Cursos para comprar */}
              <motion.h2 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.7 }} 
                className="text-2xl md:text-3xl font-extrabold text-white mb-16 text-center bg-black/40 rounded-lg px-6 py-3 w-fit mx-auto shadow-lg backdrop-blur-md"
              >
                Cursos Completos
              </motion.h2>
            </>
          )}

          {/* Si el usuario está autenticado */}
          {user && (
            <>
              {/* Mostrar cursos con acceso */}
              {Object.values(userAccess).some(access => access.hasAccess) && (
                <>
                  <motion.h2 
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.7 }} 
                    className="text-2xl md:text-3xl font-extrabold text-white mb-16 text-center bg-green-800/40 rounded-lg px-6 py-3 w-fit mx-auto shadow-lg backdrop-blur-md"
                  >
                    ✅ Tus cursos activos
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.7, delay: 0.1 }} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32"
                  >
                    {dbCourses.map((course) => {
                      const access = userAccess[course.slug];
                      if (!access?.hasAccess) return null;
                      
                      const cursoData = cursos.find(c => c.area === course.slug);
                      
                      return (
                        <div key={course.id} className="relative">
                          <CompleteCourseCard
                            title={course.title}
                            img={cursoData?.completo.img || course.image_url}
                            price={49.99}
                            badge="Activo"
                            area={course.slug as "ciencias" | "ccss"}
                            hasAccess={true}
                          />
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-30">
                            Acceso Completo
                          </div>
                          {access.expiresAt && (
                            <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-30">
                              Expira: {new Date(access.expiresAt).toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                </>
              )}

              {/* Mostrar cursos sin acceso */}
              {dbCourses.some(course => !userAccess[course.slug]?.hasAccess) && (
                <>
                  <motion.h2 
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.7 }} 
                    className="text-2xl md:text-3xl font-extrabold text-white mb-16 text-center bg-orange-800/40 rounded-lg px-6 py-3 w-fit mx-auto shadow-lg backdrop-blur-md"
                  >
                    📚 Amplía tu aprendizaje
                  </motion.h2>
                </>
              )}
            </>
          )}

          {/* Cursos Completos - Para comprar o sin acceso */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.7, delay: 0.1 }} 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32"
          >
            {dbCourses.map((course) => {
              const access = userAccess[course.slug];
              const cursoData = cursos.find(c => c.area === course.slug);
              
              // Si el usuario tiene acceso, no mostrar en esta sección
              if (user && access?.hasAccess) return null;
              
              return (
                <CompleteCourseCard
                  key={course.id}
                  title={course.title}
                  img={cursoData?.completo.img || course.image_url}
                  price={49.99}
                  badge={cursoData?.completo.badge || "Premium"}
                  area={course.slug as "ciencias" | "ccss"}
                  hasAccess={false}
                />
              );
            })}
          </motion.div>

          {/* Solo mostrar bloques individuales si no está autenticado o no tiene acceso completo */}
          {(!user || !Object.values(userAccess).every(access => access.hasAccess)) && (
            <>
              {/* Bloques Ciencias */}
              <motion.h3 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.7, delay: 0.2 }} 
                className="text-2xl md:text-3xl font-extrabold text-white mb-16 text-center bg-black/40 rounded-lg px-6 py-3 w-fit mx-auto shadow-lg backdrop-blur-md"
              >
                Bloques 2º Bachillerato (Ciencias)
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.7, delay: 0.3 }} 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-32"
              >
                {cursos[0].modulos.map((m) => (
                  <ParallaxCourseCard
                    key={m.nombre}
                    title={m.nombre}
                    img={m.img}
                    price={m.precio}
                    description={m.descripcion}
                    area="ciencias"
                  />
                ))}
              </motion.div>

              {/* Bloques CCSS */}
              <motion.h3 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.7, delay: 0.4 }} 
                className="text-2xl md:text-3xl font-extrabold text-white mb-16 text-center bg-black/40 rounded-lg px-6 py-3 w-fit mx-auto shadow-lg backdrop-blur-md"
              >
                Bloques 2º Bachillerato (Ciencias Sociales)
              </motion.h3>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.7, delay: 0.5 }} 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
              >
                {cursos[1].modulos.map((m) => (
                  <ParallaxCourseCard
                    key={m.nombre}
                    title={m.nombre}
                    img={m.img}
                    price={m.precio}
                    description={m.descripcion}
                    area="ccss"
                  />
                ))}
              </motion.div>
            </>
          )}

          {/* Mensaje especial para usuarios con acceso completo */}
          {user && Object.values(userAccess).length > 0 && Object.values(userAccess).every(access => access.hasAccess) && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.7 }}
              className="bg-green-900/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-8 text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                ¡Felicidades!
              </h3>
              <p className="text-green-100 text-lg mb-6">
                Tienes acceso completo a todos nuestros cursos. ¡Continúa aprendiendo y dominando las matemáticas!
              </p>
              <Link 
                href="/perfil"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
              >
                Ver mi progreso
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
} 