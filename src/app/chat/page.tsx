'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import MathChatbot from '@/components/MathChatbot';

export default function ChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chat con MathBot
          </h1>
          <p className="text-gray-600">
            Tu asistente personal de matemáticas
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <MathChatbot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
} 