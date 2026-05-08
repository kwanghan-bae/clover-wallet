/* eslint-disable import/first */
jest.unmock('../../hooks/useAuth');
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
    logout: jest.fn().mockResolvedValue(undefined),
    devLogin: jest.fn(),
  },
}));

jest.mock('../../utils/dev-auth', () => ({
  isDevAuthBypass: jest.fn().mockReturnValue(false),
  getDevUserEmail: jest.fn().mockReturnValue('dev1@local.test'),
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth, AuthProvider } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { authApi } from '../../api/auth';
import { isDevAuthBypass } from '../../utils/dev-auth';

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

  it('should throw when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
  });

  describe('dev mode auto-login', () => {
    beforeEach(() => {
      (isDevAuthBypass as jest.Mock).mockReturnValue(true);
    });

    afterEach(() => {
      (isDevAuthBypass as jest.Mock).mockReturnValue(false);
    });

    it('isDevAuthBypass=true이면 부팅 시 authApi.devLogin이 자동 호출되고 user 상태가 채워짐', async () => {
      const devUser = { id: 4, email: 'dev1@local.test', nickname: null };
      (authApi.devLogin as jest.Mock).mockResolvedValue({
        accessToken: 'dev-at',
        refreshToken: 'dev-rt',
        user: devUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(authApi.devLogin).toHaveBeenCalledWith('dev1@local.test');
      expect(result.current.user).toEqual(devUser);
      expect(supabase.auth.onAuthStateChange).not.toHaveBeenCalled();
    });
  });
});
