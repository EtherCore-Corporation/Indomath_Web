'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase as supabaseClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user && !loading) {
      router.push('/perfil');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login for:', formData.email);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        // El AuthProvider detectará el cambio automáticamente
        router.push('/perfil');
      }
    } catch (err: unknown) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
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
        <h2 className="mb-8 text-center text-3xl font-extrabold text-indigo-900 drop-shadow">Iniciar Sesión</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-900 mb-1">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-900 mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          <div className="text-sm text-center mt-4 space-y-2">
            <div>
              <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                ¿No tienes una cuenta? Regístrate
              </Link>
            </div>
            <div>
              <Link href="/auth/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 