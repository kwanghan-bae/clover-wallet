jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

jest.mock('../../api/auth', () => ({
  authApi: {
    login: jest.fn().mockResolvedValue({ accessToken: 'test-token', user: { id: 1, email: 'test@test.com', nickname: null } }),
  },
}));

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading true and no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('should call supabase signInWithOAuth on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' }),
    );
  });

  it('should clear storage on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.logout();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
