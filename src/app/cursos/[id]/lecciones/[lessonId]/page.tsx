'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';

import ContentGuard from '@/components/ContentGuard';
import AccessDenied from '@/components/AccessDenied';
import { use, useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { HiOutlinePlay, HiOutlineCheckCircle } from 'react-icons/hi';

interface Video {
  id: string;
  lesson_id: string;
  bunny_video_id: string;
  title: string | null;
  description: string | null;
  duration: string | null;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  library_id: string | null;
}

interface Course {
  id: string;
  slug: string;
  title: string;
}

// Tipos para módulos con lecciones
interface ModuleWithLessons {
  id: string;
  title: string;
  order_index: number;
  library_id: string | null;
  lessons: { id: string; title: string; order_index: number }[];
}

interface LessonData {
  lesson: Lesson;
  module: Module;
  course: Course;
  videos: Video[];
  allLessons: { id: string; title: string; order_index: number }[];
  modulesWithLessons: ModuleWithLessons[];
}

// Mapeo de productos Stripe para los cursos
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

async function getLessonData(courseSlug: string, lessonId: string): Promise<LessonData | null> {
  // Fetch lesson
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();
  if (lessonError || !lesson) return null;

  // Fetch module
  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('id', lesson.module_id)
    .single();

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', module.course_id)
    .single();
  if (!course || course.slug !== courseSlug) return null;

  // Fetch videos for this lesson
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('created_at', { ascending: true });

  // Fetch all modules for this course (with lessons)
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order_index, library_id')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  // For each module, fetch its lessons
  let modulesWithLessons: ModuleWithLessons[] = [];
  if (modules) {
    modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, title, order_index')
          .eq('module_id', mod.id)
          .order('order_index', { ascending: true });
        return { ...mod, lessons: lessons || [] };
      })
    );
  }

  // Fetch all lessons in this module (for navigation)
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, order_index')
    .eq('module_id', module.id)
    .order('order_index', { ascending: true });

  return { lesson, module, course, videos: videos || [], allLessons: allLessons || [], modulesWithLessons };
}

export default function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = use(params);
  const { loading: authLoading } = useAuthContext();
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de la lección
  useEffect(() => {
    async function fetchLessonData() {
      try {
        const data = await getLessonData(id, lessonId);
        if (!data) {
          setError('Lección no encontrada');
          return;
        }
        setLessonData(data);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError('Error al cargar la lección');
      } finally {
        setLoading(false);
      }
    }

    fetchLessonData();
  }, [id, lessonId]);

  // Mostrar loading mientras se cargan los datos
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1633] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-[#0a1633] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error || 'Lección no encontrada'}</p>
          <Link href="/cursos" className="text-blue-400 hover:text-blue-300 underline mt-4 inline-block">
            Volver a cursos
          </Link>
        </div>
      </div>
    );
  }

  const { lesson, module, course, videos, allLessons, modulesWithLessons } = lessonData;

  // Encuentra el índice de la lección actual
  const currentIdx = allLessons.findIndex((l: Record<string, unknown>) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Determinar el courseType basado en el slug
  const courseType = course.slug === 'ciencias' ? 'CIENCIAS' : 'CCSS';
  const stripeProduct = STRIPE_PRODUCTS[course.slug as keyof typeof STRIPE_PRODUCTS];

  // Componente de contenido de la lección que se mostrará solo si tiene acceso
  const LessonContent = () => (
    <>

      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-[#181c3a] border-r border-[#23274d] py-8 px-4 text-white sticky top-0 h-screen shadow-xl z-10">
          <h2 className="text-xl font-bold mb-6 tracking-wide text-indigo-400">Contenido del curso</h2>
          <nav className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-2">
              {modulesWithLessons.map((mod) => (
                <li key={mod.id}>
                  <details open={mod.id === module.id} className="group">
                    <summary
                      className={`flex items-center px-3 py-2 rounded-lg transition-all font-semibold text-base gap-2 cursor-pointer select-none
                        ${mod.id === module.id
                          ? 'bg-gradient-to-r from-indigo-700 to-blue-600 text-white shadow-lg'
                          : 'hover:bg-[#23274d] text-indigo-100 hover:text-white'}
                      `}
                    >
                      <span className="truncate">{mod.title}</span>
                    </summary>
                    <ul className="pl-2 mt-2 space-y-1">
                      {mod.lessons.map((l, idx: number) => (
                        <li key={l.id}>
                          <Link
                            href={`/cursos/${course.slug}/lecciones/${l.id}`}
                            className={`flex items-center px-3 py-2 rounded-md transition-all font-medium text-sm gap-2
                              ${l.id === lesson.id
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg'
                                : 'hover:bg-[#23274d] text-indigo-100 hover:text-white'}
                            `}
                          >
                            <HiOutlinePlay className={`w-4 h-4 ${l.id === lesson.id ? 'text-white' : 'text-indigo-400'}`} />
                            <span className="truncate">{idx + 1}. {l.title}</span>
                            {l.id === lesson.id && <HiOutlineCheckCircle className="w-4 h-4 ml-auto text-green-300" />}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen bg-white/5 md:bg-transparent">
          <div className="max-w-3xl mx-auto w-full px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex mb-6 text-sm text-indigo-200">
              <Link href="/cursos" className="hover:text-indigo-400">Cursos</Link>
              <span className="mx-2">→</span>
              <Link href={`/cursos/${course.slug}`} className="hover:text-indigo-400">{course.title}</Link>
              <span className="mx-2">→</span>
              <span className="text-indigo-100">{lesson.title}</span>
            </nav>

            <h1 className="text-3xl font-extrabold mb-2 text-white drop-shadow-lg">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-indigo-100 mb-6 text-lg">{lesson.description}</p>
            )}

            {/* Video(s) */}
            {videos.length > 0 ? (
              videos.map((video: Video) => (
                <div key={video.id} className="mb-8">
                  {module.library_id && video.bunny_video_id ? (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-2xl bg-gradient-to-br from-indigo-900 via-[#23274d] to-blue-900 border border-indigo-700">
                      <iframe
                        src={`https://iframe.mediadelivery.net/embed/${module.library_id}/${video.bunny_video_id}`}
                        title={video.title || lesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <HiOutlinePlay className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-semibold">Video no disponible</p>
                        <p className="text-sm text-gray-300">Este video está siendo procesado</p>
                      </div>
                    </div>
                  )}
                  {video.title && video.title !== lesson.title && (
                    <h3 className="text-xl font-semibold mb-2 text-white">{video.title}</h3>
                  )}
                  {video.description && (
                    <p className="text-indigo-100 mb-4">{video.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <HiOutlinePlay className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold">Sin video</p>
                  <p className="text-sm text-gray-300">Esta lección no tiene video asociado</p>
                </div>
              </div>
            )}

            {/* Contenido adicional */}
            {lesson.content && (
              <div className="bg-gradient-to-br from-indigo-900/50 via-[#23274d]/50 to-blue-900/50 rounded-2xl p-6 mb-8 shadow-lg border border-indigo-700/30 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-4 text-white">Contenido adicional</h3>
                <div className="text-indigo-100 whitespace-pre-wrap">{lesson.content}</div>
              </div>
            )}

            {/* Navegación entre lecciones */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-indigo-700/30">
              {prevLesson ? (
                <Link
                  href={`/cursos/${course.slug}/lecciones/${prevLesson.id}`}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-lg shadow-lg hover:from-indigo-800 hover:to-blue-700 transition-all"
                >
                  <span className="mr-2">←</span>
                  <span className="font-semibold">Anterior: {prevLesson.title}</span>
                </Link>
              ) : (
                <div></div>
              )}
              {nextLesson ? (
                <Link
                  href={`/cursos/${course.slug}/lecciones/${nextLesson.id}`}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all"
                >
                  <span className="font-semibold">Siguiente: {nextLesson.title}</span>
                  <span className="ml-2">→</span>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );

  // Componente de acceso denegado personalizado
  const AccessDeniedComponent = () => (
    <AccessDenied
      title="Lección Premium"
      message={`Esta lección pertenece al curso "${course.title}" que es contenido premium. Compra el curso para acceder a todas las lecciones.`}
      showPurchaseButton={true}
      productId={stripeProduct?.productId}
      priceId={stripeProduct?.priceId}
      productName={stripeProduct?.name}
      productPrice={stripeProduct?.price}
      productType={stripeProduct?.type}
      courseType={stripeProduct?.courseType}
      contentType="lesson"
    />
  );

  return (
    <ContentGuard
      contentType="course"
      contentId={course.slug}
      courseType={courseType}
      fallback={<AccessDeniedComponent />}
      showPurchaseButton={false} // Lo manejamos en el fallback personalizado
    >
      <LessonContent />
    </ContentGuard>
  );
} 