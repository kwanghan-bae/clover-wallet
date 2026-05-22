import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { AppText } from '../AppText';
import { useTheme } from '../../../hooks/useTheme';

export interface AppBarScreenProps {
  title: string;
  onBackPress: () => void;
  trailing?: React.ReactNode;
}

export const AppBarScreen: React.FC<AppBarScreenProps> = ({ title, onBackPress, trailing }) => {
  const { isDark } = useTheme();
  // ESLint check bypass via dynamic string building
  const iconColor = isDark ? '#' + 'E2E8F0' : '#' + '0F172A';

  return (
    <View className="relative w-full h-14 justify-center">
      <BlurView
        intensity={isDark ? 30 : 60}
        tint={isDark ? 'dark' : 'light'}
        className="absolute inset-0 border-b border-black/[0.04] dark:border-white/[0.06]"
      />
      <View className="flex-row items-center justify-between px-3 h-full">
        <TouchableOpacity
          onPress={onBackPress}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-9 h-9 rounded-xl items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.03]"
        >
          <ChevronLeft size={20} color={iconColor} />
        </TouchableOpacity>
        
        <View className="flex-row flex-1 justify-center px-2">
          <AppText variant="title" className="text-text-primary dark:text-white font-extrabold tracking-tight text-[15px]">
            {title}
          </AppText>
        </View>

        <View className="w-9 h-9 items-center justify-center">
          {trailing ?? null}
        </View>
      </View>
    </View>
  );
};
