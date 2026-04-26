import {
  createContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabase';
import { authApi } from '../api/auth';
import { saveItem, loadItem, removeItem } from '../utils/storage';
import { Logger } from '../utils/logger';

export interface AuthUser {
  id: number;
  email: string;
  nickname: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadItem<AuthUser>('user.profile');
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
            if (response.refreshToken) {
              saveItem('auth.refresh_token', response.refreshToken);
            }
            saveItem('user.profile', response.user);
            setUser(response.user);
          } catch (error) {
            Logger.error('AuthProvider', 'Backend login failed:', error);
          }
        }
        if (event === 'SIGNED_OUT') {
          removeItem('auth.access_token');
          removeItem('auth.refresh_token');
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
          await authApi.logout(token);
        } catch {
          // Backend logout failure is non-critical
        }
      }
      await supabase.auth.signOut();
      removeItem('auth.access_token');
      removeItem('auth.refresh_token');
      removeItem('user.profile');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, isLoading, isAuthenticated: !!user, signInWithGoogle, logout } },
    children,
  );
}
