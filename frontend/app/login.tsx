import React, { useState } from 'react';
import { 
  View, 
  SafeAreaView, 
  Image,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { Clover } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
      colors={['#10b981', '#047857']}
      style={{ flex: 1 }}
    >
      {/* Decorative Background Circles */}
      <View 
        className="w-48 h-48 rounded-full bg-white/10 absolute -top-12 -left-12 blur-2xl"
      />
      <View 
        className="w-32 h-32 rounded-full bg-white/10 absolute bottom-24 -right-8 blur-xl"
      />

      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <Card className="w-full max-w-sm bg-white/90 backdrop-blur-xl border-white/20 shadow-xl">
          <CardHeader className="items-center pb-2">
            <View className="bg-emerald-100 p-4 rounded-full mb-4 ring-4 ring-emerald-50">
              <Clover size={40} color="#10b981" fill="#10b981" />
            </View>
            <CardTitle className="text-3xl text-emerald-950">Clover Wallet</CardTitle>
            <CardDescription className="text-emerald-700/80 text-center">
              당신의 행운을 스마트하게 관리하세요
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Space for future inputs if needed */}
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 shadow-sm active:bg-slate-50"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png' }}
                className="w-5 h-5 mr-3"
              />
              <View>
                <LinkText text="Google 계정으로 계속하기" isLoading={isLoading} />
              </View>
            </Button>
            <View className="flex-row justify-center mt-2">
              <Button variant="link" size="sm" label="개인정보 처리방침" className="text-xs text-slate-400" />
            </View>
          </CardFooter>
        </Card>
      </SafeAreaView>
    </LinearGradient>
  );
}

const LinkText = ({ text, isLoading }: { text: string, isLoading: boolean }) => (
  <Text className="text-slate-700 font-semibold text-base">
    {isLoading ? "로그인 중..." : text}
  </Text>
);
