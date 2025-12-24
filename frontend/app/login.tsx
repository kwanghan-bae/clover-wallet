import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../components/ui/GlassCard';
import { Clover } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
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

          <Text className="text-white text-3xl font-black tracking-widest">
            Clover Wallet
          </Text>
          <Text className="text-white/90 text-sm mt-2 mb-12">
            행운을 관리하는 스마트한 습관
          </Text>

          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <TouchableOpacity 
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              className="bg-white w-full py-4 rounded-full flex-row justify-center items-center shadow-md"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png' }}
                className="w-6 h-6 mr-3"
              />
              <Text className="text-[#1A1A1A] text-base font-bold">
                Google 계정으로 계속하기
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      </SafeAreaView>
    </LinearGradient>
  );
}
