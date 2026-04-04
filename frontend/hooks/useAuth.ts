import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { authApi } from '../api/auth';
import { saveItem, loadItem, removeItem } from '../utils/storage';

interface User {
  id: number;
  email: string;
  nickname: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadItem<User>('user.profile');
    const token = loadItem<string>('auth.access_token');
    if (stored && token) {
      setUser(stored);
    }
    setIsLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const response = await authApi.login(session.access_token);
            saveItem('auth.access_token', response.accessToken);
            saveItem('user.profile', response.user);
            setUser(response.user);
          } catch (error) {
            console.error('Backend login failed:', error);
          }
        }
        if (event === 'SIGNED_OUT') {
          removeItem('auth.access_token');
          removeItem('user.profile');
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = loadItem<string>('auth.access_token');
      if (token) {
        try {
          await (authApi as any).logout?.(token);
        } catch {
          // Backend logout failure is non-critical
        }
      }
      await supabase.auth.signOut();
      removeItem('auth.access_token');
      removeItem('user.profile');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
  };
}
