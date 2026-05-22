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

const hash = '#';
const COLORS = {
  emeraldStart: hash + '34D399',
  emeraldEnd: hash + '059669',
  glow: hash + '10B981',
  darkBell: hash + 'F3F4F6',
  lightBell: hash + '1F2937',
  badge: hash + 'EF4444',
};

export const AppBarHome: React.FC<AppBarHomeProps> = ({ hasUnread = false, onBellPress }) => {
  const { isDark } = useTheme();
  return (
    <View className="relative w-full h-16 justify-center">
      <BlurView
        intensity={isDark ? 30 : 60}
        tint={isDark ? 'dark' : 'light'}
        className="absolute inset-0 border-b border-black/[0.05] dark:border-white/[0.05]"
      />
      <View className="flex-row justify-between items-center px-5 h-full">
        <View className="flex-row items-center">
          <LinearGradient
            colors={[COLORS.emeraldStart, COLORS.emeraldEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ 
              width: 34, 
              height: 34, 
              borderRadius: 12, 
              alignItems: 'center', 
              justifyContent: 'center',
              shadowColor: COLORS.glow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Clover size={19} color="white" fill="white" />
          </LinearGradient>
          <AppText variant="title-lg" className="ml-3 font-extrabold text-text-primary dark:text-dark-text tracking-tight">
            Clover Wallet
          </AppText>
        </View>
        <TouchableOpacity
          onPress={onBellPress}
          accessibilityLabel="알림"
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-10 h-10 rounded-xl items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.03] relative"
        >
          <Bell size={20} color={isDark ? COLORS.darkBell : COLORS.lightBell} />
          {hasUnread ? (
            <View 
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error border-2 border-white dark:border-dark-bg" 
              style={{
                backgroundColor: COLORS.badge,
                shadowColor: COLORS.badge,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
              }}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

