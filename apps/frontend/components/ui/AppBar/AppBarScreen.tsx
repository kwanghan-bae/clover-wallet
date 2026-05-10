import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../AppText';
import { useTheme } from '../../../hooks/useTheme';

export interface AppBarScreenProps {
  title: string;
  onBackPress: () => void;
  trailing?: React.ReactNode;
}

export const AppBarScreen: React.FC<AppBarScreenProps> = ({ title, onBackPress, trailing }) => {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-center px-2 h-14 bg-transparent">
      <TouchableOpacity
        onPress={onBackPress}
        accessibilityLabel="뒤로 가기"
        accessibilityRole="button"
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="w-10 h-10 items-center justify-center"
      >
        <ChevronLeft size={24} color={isDark ? '#E0E0E0' : '#0F1115'} />
      </TouchableOpacity>
      <View className="flex-1 items-center">
        <AppText variant="title" className="text-text-primary dark:text-dark-text">
          {title}
        </AppText>
      </View>
      <View className="w-10 h-10 items-center justify-center">{trailing ?? null}</View>
    </View>
  );
};
