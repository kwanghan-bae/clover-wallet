import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text } from 'react-native';
import { GlobalErrorBoundary } from '../components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_900Black
} from '@expo-google-fonts/noto-sans-kr';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createMMKV } from 'react-native-mmkv';
import { useAuth, AuthProvider } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useOffline } from '../hooks/useOffline';
import { useTheme } from '../hooks/useTheme';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const queryStorage = createMMKV({ id: 'query-cache' });

const persister = {
  persistClient: (client: unknown) => {
    queryStorage.set('react-query-cache', JSON.stringify(client));
  },
  restoreClient: () => {
    const cache = queryStorage.getString('react-query-cache');
    return cache ? JSON.parse(cache) : undefined;
  },
  removeClient: () => {
    queryStorage.remove('react-query-cache');
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 1000 * 60 * 60 * 24 }, // 24h cache retention
  },
});

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { registerToken } = useNotifications();
  const { isOffline } = useOffline();
  const { isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    const inAuthGroup = segments[0] === 'login';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      registerToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center' }}>
      <View
        className={`flex-1 w-full${isDark ? ' dark' : ''}`}
        style={{
          backgroundColor: isDark ? '#121212' : '#F5F7FA',
          maxWidth: 500, // Slightly wider for better desktop experience
          width: '100%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 50,
          elevation: 10,
        }}
      >
        {isOffline && (
          <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
              오프라인 모드 — 캐시된 데이터를 표시합니다
            </Text>
          </View>
        )}
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#121212' : '#F5F7FA' }
        }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    NotoSansKR_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GlobalErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PersistQueryClientProvider>
    </GlobalErrorBoundary>
  );
}
