import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { saveItem, loadItem } from '../utils/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

export function useTheme() {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePref] = useState<ThemePreference>(
    () => loadItem<ThemePreference>('app.theme') ?? 'system',
  );

  const isDark = useMemo(() => {
    if (themePreference === 'system') return systemScheme === 'dark';
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const setThemePreference = useCallback((pref: ThemePreference) => {
    setThemePref(pref);
    saveItem('app.theme', pref);
  }, []);

  return { themePreference, isDark, setThemePreference };
}
