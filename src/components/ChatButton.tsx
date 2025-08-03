'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';
import MathChatbot from './MathChatbot';

export default function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, loading } = useAuthContext();
  const router = useRouter();

  const handleChatClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setIsChatOpen(true);
  };

  // No mostrar el botón mientras se carga la autenticación
  if (loading) {
    return null;
  }

  // No mostrar el botón si el usuario no está autenticado
  if (!user) {
    return null;
  }

  return (
    <>
      <motion.button
        onClick={handleChatClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {!isChatOpen ? (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 0 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <MathChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
} 