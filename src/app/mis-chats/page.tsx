'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import Link from 'next/link';
import { 
  ChatBubbleLeftRightIcon, 
  TrashIcon, 
  StarIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  has_notes: boolean;
}

export default function MisChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && session) {
      loadChats();
    }
  }, [user, session, authLoading, router, loadChats]);

  const deleteChat = async (chatId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (authLoading) {
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
            Mis Chats
          </h1>
          <p className="text-gray-600">
            Historial de conversaciones con MathBot
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes chats aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza una conversación con MathBot para ver tu historial aquí.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Iniciar Chat
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {chat.title}
                      </h3>
                      {chat.has_notes && (
                        <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(chat.updated_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <span>{chat.message_count} mensajes</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/chat?id=${chat.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Continuar chat"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar chat"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 