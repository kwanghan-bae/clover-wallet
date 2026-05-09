import React, { useEffect } from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../components/ui/GlassCard';
import { AppText } from '../components/ui/AppText';
import { Clover } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';

/**
 * @description 구글 로그인을 통한 사용자 인증 화면입니다.
 */
const LoginScreen = () => {
  const { signInWithGoogle, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#388E3C']}
      style={{ flex: 1 }}
    >
      {/* Decorative Background Circles */}
      <View 
        style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)', position: 'absolute', top: -50, left: -50 }} 
      />
      <View 
        style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)', position: 'absolute', bottom: 100, right: -30 }} 
      />

      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <GlassCard 
          className="w-full py-12 px-8 items-center border border-white/20 shadow-2xl" 
          opacity={0.15}
          blur={10}
        >
          <View className="bg-white p-4 rounded-full shadow-lg mb-6">
            <Clover size={48} color="#4CAF50" fill="#4CAF50" />
          </View>

          <AppText variant="display" className="text-white">
            Clover Wallet
          </AppText>
          <AppText variant="caption" className="text-white/90 mt-2 mb-12">
            행운을 관리하는 스마트한 습관
          </AppText>

          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              className="bg-white w-full py-4 rounded-full flex-row justify-center items-center shadow-md shadow-button"
              accessibilityLabel="Google 계정으로 계속하기"
              accessibilityRole="button"
            >
              <Image
                source={require('../assets/images/google-logo.png')}
                className="w-6 h-6 mr-3"
                accessible={false}
              />
              <AppText variant="body-lg" className="text-text-primary dark:text-dark-text">
                Google 계정으로 계속하기
              </AppText>
            </TouchableOpacity>
          )}
        </GlassCard>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
