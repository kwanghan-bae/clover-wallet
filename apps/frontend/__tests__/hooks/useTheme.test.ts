/* eslint-disable import/first */
jest.unmock('../../hooks/useTheme');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn().mockReturnValue('light'),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should default to system theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.themePreference).toBe('system');
    expect(result.current.isDark).toBe(false);
  });

  it('should toggle to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setThemePreference('dark'));
    expect(result.current.isDark).toBe(true);
  });

  it('should toggle to light', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setThemePreference('light'));
    expect(result.current.isDark).toBe(false);
  });
});
