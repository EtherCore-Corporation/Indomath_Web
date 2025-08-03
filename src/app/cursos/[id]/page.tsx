"use client";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { coursesData } from '@/lib/course-data';
import PurchaseButton from '@/components/PurchaseButton';

import ContentGuard from '@/components/ContentGuard';

import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/AuthProvider';
import Image from 'next/image';
const IMG_CIENCIAS = 'https://indomath.es/wp-content/uploads/2023/09/1-2.png';
const IMG_CCSS = 'https://indomath.es/wp-content/uploads/2025/05/1.png';
const DURACION_CIENCIAS = '+100h';
const DURACION_CCSS = '+80h';

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

interface DatabaseCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  price: number;
  level: string;
  duration: string;
  image_url: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  video_count: number;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { loading: authLoading } = useAuthContext();
  const [dbCourse, setDbCourse] = useState<DatabaseCourse | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedModulesPreview, setExpandedModulesPreview] = useState<Set<string>>(new Set());

  // Verificar si el curso existe en los datos estáticos
  const course = coursesData.find(c => c.slug === id);
  if (!course) notFound();

  // Obtener datos del curso y módulos desde la base de datos
  useEffect(() => {
    async function fetchCourseData() {
      try {
        // Obtener curso
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, slug, title, description, long_description, price, level, duration, image_url')
          .eq('slug', id)
          .single();

        if (courseError) {
          console.error('Error fetching course:', courseError);
          setError('Error al cargar el curso');
          return;
        }

        setDbCourse(courseData);

        // Obtener módulos con lecciones
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select(`
            id,
            title,
            description,
            order_index,
            lessons (
              id,
              title,
              description,
              order_index
            )
          `)
          .eq('course_id', courseData.id)
          .order('order_index', { ascending: true });

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
          setError('Error al cargar los módulos');
          return;
        }

        // Procesar los datos y obtener el conteo de videos por lección
        const processedModules = await Promise.all(
          modulesData.map(async (module: Record<string, unknown>) => {
            const processedLessons = await Promise.all(
              (module.lessons as unknown[]).map(async (lesson: unknown) => {
                const lessonData = lesson as Record<string, unknown>;
                // Obtener conteo de videos por lección
                const { count } = await supabase
                  .from('videos')
                  .select('*', { count: 'exact', head: true })
                  .eq('lesson_id', lessonData.id as string);

                return {
                  id: lessonData.id as string,
                  title: lessonData.title as string,
                  description: lessonData.description as string,
                  order_index: lessonData.order_index as number,
                  video_count: count || 0
                };
              })
            );

            return {
              id: module.id as string,
              title: module.title as string,
              description: module.description as string,
              order_index: module.order_index as number,
              lessons: processedLessons.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.order_index as number) - (b.order_index as number))
            };
          })
        );

        setModules(processedModules);

      } catch (err) {
        console.error('Error:', err);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [id]);

  // Mostrar loading mientras se cargan los datos
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !dbCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Error</h1>
          <p className="text-gray-600">{error || 'Curso no encontrado'}</p>
          <Link href="/cursos" className="text-blue-600 hover:text-blue-500 underline mt-4 inline-block">
            Volver a cursos
          </Link>
        </div>
      </div>
    );
  }

  // Obtener información del producto Stripe
  const stripeProduct = STRIPE_PRODUCTS[course.slug as keyof typeof STRIPE_PRODUCTS];

  // Determinar el courseType basado en el slug
  const courseType = course.slug === 'ciencias' ? 'CIENCIAS' : 'CCSS';

  // Calcular estadísticas
  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalVideos = modules.reduce((acc, module) => 
    acc + module.lessons.reduce((accLesson, lesson) => accLesson + lesson.video_count, 0), 0);

  // Función para toggle de módulos
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Función para toggle de módulos en preview
  const toggleModulePreview = (moduleId: string) => {
    setExpandedModulesPreview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Componente de contenido del curso que se mostrará solo si tiene acceso
  const CourseContent = () => (
    <div className="min-h-screen bg-white">
      {/* Header con breadcrumbs */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-800">
            <Link href="/" className="hover:text-gray-900">Inicio</Link>
            <span>›</span>
            <Link href="/cursos" className="hover:text-gray-900">Cursos</Link>
            <span>›</span>
            <span className="text-gray-900">{dbCourse.title}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal - 2/3 del ancho */}
          <div className="lg:col-span-2">
            {/* Imagen del curso */}
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-8">
              <Image 
                src={course.slug === 'ciencias' ? IMG_CIENCIAS : IMG_CCSS} 
                alt={dbCourse.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Información del curso */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">IM</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Indomath</p>
                  <p className="text-xs text-gray-800">Categoría: Cursos de 2° Bachillerato Matemáticas</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{dbCourse.title}</h1>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-900 leading-relaxed">{dbCourse.long_description || dbCourse.description}</p>
              </div>

              {/* Estadísticas del curso */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Acerca de este curso</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">📊</span>
                    <span className="text-gray-900">{dbCourse.level}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">⏱️</span>
                    <span className="text-gray-900">{course.slug === 'ciencias' ? DURACION_CIENCIAS : DURACION_CCSS}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">📚</span>
                    <span className="text-gray-900">{totalLessons} lecciones</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">🎥</span>
                    <span className="text-gray-900">{totalVideos} videos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del curso */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Contenido del curso</h2>
              
              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay módulos disponibles para este curso.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">
                          Módulo {module.order_index} - {module.title}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{module.lessons.length} lecciones</span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedModules.has(module.id) && (
                        <div className="bg-white">
                          {module.lessons.length === 0 ? (
                            <div className="px-6 py-4 text-center text-gray-500">
                              <p>No hay lecciones disponibles en este módulo.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {module.lessons.map((lesson) => (
                                <Link
                                  key={lesson.id}
                                  href={`/cursos/${course.slug}/lecciones/${lesson.id}`}
                                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-1">
                                        {lesson.order_index}. {lesson.title}
                                      </h4>
                                      {lesson.description && (
                                        <p className="text-sm text-gray-600">{lesson.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 ml-4">
                                      {lesson.video_count > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {lesson.video_count} videos
                                        </span>
                                      )}
                                      <span className="text-sm text-blue-600 hover:text-blue-800">
                                        Ver lección →
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar derecho - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Card de compra */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {(stripeProduct.price / 100).toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {((stripeProduct.price / 100) * 1.5).toFixed(2)} €
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-green-600 font-medium mb-4 text-center">
                    ✅ Tienes acceso a este curso
                  </p>
                  {modules.length > 0 && modules[0]?.lessons.length > 0 ? (
                    <Link href={`/cursos/${course.slug}/lecciones/${modules[0]?.lessons[0]?.id}`} className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center">
                      Ir al curso
                    </Link>
                  ) : (
                    <button disabled className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-medium cursor-not-allowed">
                      Próximamente
                    </button>
                  )}
                </div>

                {/* Información del curso */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">📊</span>
                    <span className="text-gray-700">{dbCourse.level}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">👥</span>
                    <span className="text-gray-700">{totalLessons} Total de inscripciones</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">⏱️</span>
                    <span className="text-gray-700">{course.slug === 'ciencias' ? DURACION_CIENCIAS : DURACION_CCSS} Duración</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">📱</span>
                    <span className="text-gray-700">Última actualización: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Información del instructor */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Un curso de</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">IM</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Indomath</h4>
                    <p className="text-sm text-gray-600">Instructor de matemáticas</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Audiencia</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Estudiantes de 2° Bachillerato en la modalidad de {course.slug === 'ciencias' ? 'ciencias' : 'CCSS'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de acceso denegado personalizado
  const AccessDeniedComponent = () => (
    <div className="min-h-screen bg-white">
      {/* Header con breadcrumbs */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-800">
            <Link href="/" className="hover:text-gray-900">Inicio</Link>
            <span>›</span>
            <Link href="/cursos" className="hover:text-gray-900">Cursos</Link>
            <span>›</span>
            <span className="text-gray-900">{dbCourse.title}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal - 2/3 del ancho */}
          <div className="lg:col-span-2">
            {/* Imagen del curso */}
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-8">
              <Image 
                src={course.slug === 'ciencias' ? IMG_CIENCIAS : IMG_CCSS} 
                alt={dbCourse.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Información del curso */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">IM</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Indomath</p>
                  <p className="text-xs text-gray-800">Categoría: Cursos de 2° Bachillerato Matemáticas</p>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{dbCourse.title}</h1>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-900 leading-relaxed">{dbCourse.long_description || dbCourse.description}</p>
              </div>

              {/* Estadísticas del curso */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Acerca de este curso</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">📊</span>
                    <span className="text-gray-900">{dbCourse.level}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">⏱️</span>
                    <span className="text-gray-900">{course.slug === 'ciencias' ? DURACION_CIENCIAS : DURACION_CCSS}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">📚</span>
                    <span className="text-gray-900">{totalLessons} lecciones</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">🎥</span>
                    <span className="text-gray-900">{totalVideos} videos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del curso - Preview completo */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Contenido del curso</h2>
              
              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay módulos disponibles para este curso.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModulePreview(module.id)}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">
                          Módulo {module.order_index} - {module.title}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{module.lessons.length} lecciones</span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedModulesPreview.has(module.id) ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedModulesPreview.has(module.id) && (
                        <div className="bg-white">
                          {module.lessons.length === 0 ? (
                            <div className="px-6 py-4 text-center text-gray-500">
                              <p>No hay lecciones disponibles en este módulo.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="px-6 py-4 opacity-75"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-700 mb-1">
                                        {lesson.order_index}. {lesson.title}
                                      </h4>
                                      {lesson.description && (
                                        <p className="text-sm text-gray-500">{lesson.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 ml-4">
                                      {lesson.video_count > 0 && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                          {lesson.video_count} videos
                                        </span>
                                      )}
                                      <span className="text-sm text-gray-400">
                                        🔒
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="text-center py-8 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-blue-800 font-semibold mb-2">
                      Compra el curso para acceder a todo el contenido
                    </p>
                    <p className="text-sm text-blue-600">
                      {modules.length} módulos • {totalLessons} lecciones • {totalVideos} videos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar derecho - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Card de compra */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {(stripeProduct.price / 100).toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {((stripeProduct.price / 100) * 1.5).toFixed(2)} €
                  </div>
                </div>

                <div className="mb-6">
                  <PurchaseButton
                    productId={stripeProduct.productId}
                    priceId={stripeProduct.priceId}
                    name={stripeProduct.name}
                    price={stripeProduct.price}
                    type={stripeProduct.type}
                    courseType={stripeProduct.courseType}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  />
                </div>

                {/* Información del curso */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">📊</span>
                    <span className="text-gray-700">{dbCourse.level}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">👥</span>
                    <span className="text-gray-700">{totalLessons} Total de inscripciones</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">⏱️</span>
                    <span className="text-gray-700">{course.slug === 'ciencias' ? DURACION_CIENCIAS : DURACION_CCSS} Duración</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">📱</span>
                    <span className="text-gray-700">Última actualización: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Información del instructor */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Un curso de</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">IM</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Indomath</h4>
                    <p className="text-sm text-gray-600">Instructor de matemáticas</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Audiencia</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Estudiantes de 2° Bachillerato en la modalidad de {course.slug === 'ciencias' ? 'ciencias' : 'CCSS'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ContentGuard
      contentType="course"
      contentId={dbCourse.slug}
      courseType={courseType}
      fallback={<AccessDeniedComponent />}
      showPurchaseButton={false} // Lo manejamos en el fallback personalizado
    >
      <CourseContent />
    </ContentGuard>
  );
} 