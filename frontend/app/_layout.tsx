import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { GlobalErrorBoundary } from '../components/ErrorBoundary';
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
      <View style={{ flex: 1, backgroundColor: '#111827', alignItems: 'center' }}>
        <View
          className="flex-1 w-full bg-[#F5F7FA]"
          style={{
            maxWidth: 500, // Slightly wider for better desktop experience
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 50,
            elevation: 10,
          }}
        >
          <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5F7FA' }
          }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </View>
    </GlobalErrorBoundary>
  );
}
