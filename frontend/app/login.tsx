import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // TODO: Implement actual API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-primary">Clover Wallet</Text>
          <Text className="text-text-light mt-2 text-lg">Your luck starts here</Text>
        </View>

        <GlassCard className="p-2">
          <View className="gap-4 p-4">
            <Input 
              label="Email" 
              placeholder="example@clover.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input 
              label="Password" 
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <PrimaryButton 
              label="Login" 
              className="mt-4"
              onPress={handleLogin}
              isLoading={isLoading}
            />

            <View className="flex-row justify-center mt-4">
              <Text className="text-text-light">Don't have an account? </Text>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
