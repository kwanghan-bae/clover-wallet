import { Stack } from 'expo-router';
import { GlobalErrorBoundary } from '../components/ErrorBoundary';
import '../global.css';

export default function RootLayout() {
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
