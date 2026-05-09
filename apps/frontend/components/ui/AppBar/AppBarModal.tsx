import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { AppText } from '../AppText';

export interface AppBarModalProps {
  title: string;
  onClosePress: () => void;
  trailing?: React.ReactNode;
}

export const AppBarModal: React.FC<AppBarModalProps> = ({ title, onClosePress, trailing }) => (
  <View className="flex-row items-center px-2 h-14 bg-transparent">
    <TouchableOpacity
      onPress={onClosePress}
      accessibilityLabel="닫기"
      accessibilityRole="button"
      activeOpacity={0.7}
      className="w-10 h-10 items-center justify-center"
    >
      <X size={22} color="#0F1115" />
    </TouchableOpacity>
    <View className="flex-1 items-center">
      <AppText variant="title" className="text-text-primary dark:text-dark-text">
        {title}
      </AppText>
    </View>
    <View className="w-10 h-10 items-center justify-center">{trailing ?? null}</View>
  </View>
);
