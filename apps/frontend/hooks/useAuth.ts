import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthState } from '../context/AuthContext';

export { AuthContext, AuthProvider } from '../context/AuthContext';
export type { AuthUser, AuthState } from '../context/AuthContext';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
