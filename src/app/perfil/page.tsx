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
  ClockIcon,
  Cog6ToothIcon,
  KeyIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import ProgressCircle from '@/components/ProgressCircle';
import CourseCard from '@/components/CourseCard';
import { supabase } from '@/lib/supabase';

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
  
  // Estados para configuración de perfil
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Funciones para gestión de perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');
    setUpdateMessage('');

    try {
      // Actualizar metadata del usuario
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profileForm.name
        }
      });

      if (updateError) {
        throw updateError;
      }

      setUpdateMessage('Perfil actualizado exitosamente');
      setEditingProfile(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');
    setUpdateMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setUpdateError('Las contraseñas nuevas no coinciden');
      setIsUpdating(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setUpdateError('La nueva contraseña debe tener al menos 6 caracteres');
      setIsUpdating(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        throw error;
      }

      setUpdateMessage('Contraseña actualizada exitosamente');
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setUpdateError(error instanceof Error ? error.message : 'Error al cambiar contraseña');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && session) {
      loadUserStats();
      loadUserCourses();
      
      // Inicializar formulario de perfil con datos del usuario
      setProfileForm({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      });
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

            {/* Configuración de Perfil */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  {showSettings ? 'Ocultar' : 'Configurar'}
                </button>
              </div>

              {/* Mensajes de estado */}
              {updateMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{updateMessage}</span>
                </div>
              )}
              
              {updateError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{updateError}</span>
                </div>
              )}

              {showSettings && (
                <div className="space-y-6">
                  {/* Información del perfil */}
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2" />
                        Información Personal
                      </h3>
                      <button
                        onClick={() => setEditingProfile(!editingProfile)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {editingProfile ? 'Cancelar' : 'Editar'}
                      </button>
                    </div>

                    {editingProfile ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email (solo lectura)
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={profileForm.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            El email no se puede cambiar por motivos de seguridad
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                          >
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProfile(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Nombre:</span>
                          <p className="text-gray-900">{user?.user_metadata?.name || 'No especificado'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Método de registro:</span>
                          <p className="text-gray-900">
                            {user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cambio de contraseña (solo para usuarios de email) */}
                  {user?.app_metadata?.provider !== 'google' && (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <KeyIcon className="w-5 h-5 mr-2" />
                          Cambiar Contraseña
                        </h3>
                        <button
                          onClick={() => setChangingPassword(!changingPassword)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {changingPassword ? 'Cancelar' : 'Cambiar'}
                        </button>
                      </div>

                      {changingPassword ? (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              Nueva contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showNewPassword ? 
                                  <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : 
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                }
                              </button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                              Confirmar nueva contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showConfirmPassword ? 
                                  <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : 
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                }
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                              {isUpdating ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setChangingPassword(false);
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-gray-600">
                          Mantén tu cuenta segura cambiando tu contraseña regularmente.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cerrar sesión */}
                  <div className="border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Cerrar Sesión</h3>
                    <p className="text-red-600 mb-4">
                      Cierra tu sesión en este dispositivo. Podrás volver a iniciar sesión cuando quieras.
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
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