import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GlobalErrorBoundary } from '../components/ErrorBoundary';
// eslint-disable-next-line import/no-unresolved
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_900Black
} from '@expo-google-fonts/noto-sans-kr';
import '../global.css';

SplashScreen.preventAutoHideAsync();

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
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7FA' }
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GlobalErrorBoundary>
  );
}
