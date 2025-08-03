'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { 
  EnvelopeIcon, 
  CalendarIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import ProgressCircle from '@/components/ProgressCircle';
import CourseCard from '@/components/CourseCard';

interface CourseStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  level?: string;
  duration?: string;
}

export default function PerfilPage() {
  const { user, session, loading } = useAuthContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    memberSince: ''
  });
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    overallProgress: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const loadUserStats = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalChats: data.chats?.length || 0,
          totalMessages: data.chats?.reduce((acc: number, chat: Record<string, unknown>) => acc + ((chat.message_count as number) || 0), 0) || 0,
          memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Reciente'
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, [session?.access_token, user?.created_at]);

  const loadUserCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch('/api/user-courses', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setCourseStats(data.stats || {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          overallProgress: 0
        });
      }
    } catch (error) {
      console.error('Error loading user courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && session) {
      loadUserStats();
      loadUserCourses();
    }
  }, [user, session, loading, router, loadUserStats, loadUserCourses]);

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil de Estudiante
          </h1>
          <p className="text-gray-600">
            Gestiona tu cuenta y revisa tu progreso académico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Información del usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {getUserInitials(user.email || '')}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{getUserName()}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Miembro desde {stats.memberSince}</span>
                </div>
              </div>

              {/* Progreso general */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Progreso General
                </h3>
                <div className="flex justify-center mb-4">
                  <ProgressCircle
                    percentage={courseStats.overallProgress}
                    size={80}
                    strokeWidth={8}
                  />
                </div>
                <p className="text-center text-sm text-gray-600">
                  {courseStats.overallProgress}% completado
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Chats</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpenIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{courseStats.inProgressCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrophyIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cursos Completados</p>
                    <p className="text-2xl font-bold text-gray-900">{courseStats.completedCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lecciones Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{courseStats.completedLessons}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cursos del usuario */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
                <Link
                  href="/cursos"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <AcademicCapIcon className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Link>
              </div>

              {loadingCourses ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes cursos inscritos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Explora nuestros cursos y comienza tu aprendizaje.
                  </p>
                  <Link
                    href="/cursos"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <AcademicCapIcon className="w-4 h-4 mr-2" />
                    Ver Cursos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        ...course,
                        slug: course.id // Using id as slug for now
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 