'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase as supabaseClient } from '@/lib/supabase';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthContext();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si hay token en la URL (paso de reset)
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'recovery') {
      setStep('reset');
    }
  }, [searchParams]);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user && !loading) {
      router.push('/perfil');
    }
  }, [user, loading, router]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      console.log('📧 Enviando email de recuperación a:', formData.email);
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Error enviando email:', error);
        throw new Error(error.message);
      }

      console.log('✅ Email de recuperación enviado');
      setSuccess('Se ha enviado un email con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      
    } catch (err: unknown) {
      console.error('❌ Error en solicitud de reset:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Verificar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Verificar que la contraseña tenga al menos 6 caracteres
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      console.log('🔐 Actualizando contraseña...');
      
      const { error } = await supabaseClient.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('❌ Error actualizando contraseña:', error);
        throw new Error(error.message);
      }

      console.log('✅ Contraseña actualizada correctamente');
      setSuccess('Tu contraseña ha sido actualizada correctamente. Serás redirigido al login.');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (err: unknown) {
      console.error('❌ Error en reset de contraseña:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No mostrar la página si ya está logueado
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-indigo-900 via-blue-700 to-purple-700 bg-[length:400%_400%]" style={{animation: 'gradientBG 10s ease-in-out infinite'}} />
      <style>{`
        @keyframes gradientBG {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      
      <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-indigo-100">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-indigo-900 drop-shadow">
          {step === 'request' ? 'Restablecer Contraseña' : 'Nueva Contraseña'}
        </h2>
        
        {step === 'request' ? (
          // Paso 1: Solicitar email
          <form className="space-y-6" onSubmit={handleRequestReset}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-900 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="Tu correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Recuperación'}
            </button>
            
            <div className="text-sm text-center mt-4">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                Volver al login
              </Link>
            </div>
          </form>
        ) : (
          // Paso 2: Establecer nueva contraseña
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-900 mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-900 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
            
            <div className="text-sm text-center mt-4">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 