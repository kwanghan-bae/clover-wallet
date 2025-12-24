import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

export const LottoBall = ({ number, size = 'md', delay = 0, className }: LottoBallProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, [number]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBallColor = (num: number) => {
    if (num <= 10) return 'bg-[#FBC400]';
    if (num <= 20) return 'bg-[#69C8F2]';
    if (num <= 30) return 'bg-[#FF7272]';
    if (num <= 40) return 'bg-[#AAAAAA]';
    return 'bg-[#B0D840]';
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <Animated.View 
      style={animatedStyle}
      className={cn(
        "rounded-full items-center justify-center shadow-sm border border-black/10", 
        getBallColor(number),
        sizeClasses[size],
        className
      )}
    >
      <Text className={cn("font-bold text-white shadow-text", textSizeClasses[size])}>
        {number}
      </Text>
    </Animated.View>
  );
};
