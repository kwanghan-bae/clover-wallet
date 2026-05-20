import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clover } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { AppText } from '../AppText';
import { useTheme } from '../../../hooks/useTheme';

export interface AppBarHomeProps {
  hasUnread?: boolean;
  onBellPress: () => void;
}

export const AppBarHome: React.FC<AppBarHomeProps> = ({ hasUnread = false, onBellPress }) => {
  const { isDark } = useTheme();
  return (
    <View className="relative w-full h-16 justify-center">
      <BlurView
        intensity={isDark ? 25 : 45}
        tint={isDark ? 'dark' : 'light'}
        className="absolute inset-0 border-b border-black/[0.03] dark:border-white/[0.03]"
      />
      <View className="flex-row justify-between items-center px-5 h-full">
        <View className="flex-row items-center">
          <LinearGradient
            colors={['#81C784', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 10, 
              alignItems: 'center', 
              justifyContent: 'center',
              shadowColor: '#2E7D32',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Clover size={18} color="white" fill="white" />
          </LinearGradient>
          <AppText variant="title-lg" className="ml-2.5 font-bold text-text-primary dark:text-dark-text tracking-tight">
            Clover Wallet
          </AppText>
        </View>
        <TouchableOpacity
          onPress={onBellPress}
          accessibilityLabel="알림"
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-xl items-center justify-center bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.02] dark:border-white/[0.02]"
        >
          <Bell size={19} color={isDark ? '#E0E0E0' : '#0F1115'} />
          {hasUnread ? (
            <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error border-2 border-white dark:border-dark-bg" />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

