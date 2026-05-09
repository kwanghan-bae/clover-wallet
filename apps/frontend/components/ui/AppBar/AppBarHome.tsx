import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clover } from 'lucide-react-native';
import { AppText } from '../AppText';

export interface AppBarHomeProps {
  hasUnread?: boolean;
  onBellPress: () => void;
}

export const AppBarHome: React.FC<AppBarHomeProps> = ({ hasUnread = false, onBellPress }) => (
  <View className="flex-row justify-between items-center px-5 h-14 bg-transparent">
    <View className="flex-row items-center">
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}
      >
        <Clover size={16} color="white" fill="white" />
      </LinearGradient>
      <AppText variant="title-lg" className="ml-2 text-text-primary dark:text-dark-text">
        Clover Wallet
      </AppText>
    </View>
    <TouchableOpacity
      onPress={onBellPress}
      accessibilityLabel="알림"
      accessibilityRole="button"
      activeOpacity={0.7}
      className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04]"
    >
      <Bell size={18} color="#0F1115" />
      {hasUnread ? (
        <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border-2 border-surface-muted" />
      ) : null}
    </TouchableOpacity>
  </View>
);
