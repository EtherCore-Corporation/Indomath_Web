'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('✅ Auth tokens found, setting session...');
          
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            throw error;
          }

          if (data.user) {
            console.log('✅ User authenticated:', data.user.email);
            
            // Check if this is a new user (first time login with Google)
            const isNewUser = data.user.created_at === data.user.last_sign_in_at;
            
            if (isNewUser) {
              console.log('👤 New Google user detected');
              // Could send welcome email here if needed
            }
            
            // Redirect to profile or intended page
            router.push('/perfil');
            return;
          }
        }

        // If no tokens in hash, try getting session normally
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log('✅ Session found, redirecting...');
          router.push('/perfil');
        } else {
          console.log('❌ No session found, redirecting to login...');
          router.push('/auth/login?error=auth_failed');
        }

      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Error de autenticación');
        
        // Redirect to login with error after a delay
        setTimeout(() => {
          router.push('/auth/login?error=auth_failed');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando autenticación...</h2>
        <p className="text-gray-600">Por favor espera mientras te redirigimos.</p>
      </div>
    </div>
  );
}
