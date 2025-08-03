'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase as supabaseClient } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          return;
        }

        if (mounted) {
          console.log('✅ Initial session loaded:', session?.user?.email || 'No user');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      } else {
        console.log('✅ User signed out successfully');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  console.log('🎯 AuthProvider state:', { 
    user: user?.email || 'No user', 
    loading, 
    hasSession: !!session 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 