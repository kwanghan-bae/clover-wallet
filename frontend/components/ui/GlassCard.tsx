import React, { useEffect } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

export const GlassCard = ({ intensity = 50, className, delay = 0, children, ...props }: GlassCardProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(opacity.value === 1 ? 0 : 10) }]
  }));

  return (
    <Animated.View 
      className={cn("overflow-hidden rounded-2xl border border-white/20 shadow-sm", className)} 
      style={animatedStyle}
      {...props}
    >
      <BlurView 
        intensity={intensity} 
        tint="light" 
        style={{ flex: 1 }}
        className="bg-white/60 dark:bg-black/40"
      >
        <View className="p-4">
          {children}
        </View>
      </BlurView>
    </Animated.View>
  );
};
