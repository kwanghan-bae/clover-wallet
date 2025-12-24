import React, { useEffect } from 'react';
import { Text } from 'react-native';
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
    scale.value = withDelay(delay, withSpring(1, { 
      damping: 12,
      mass: 0.8,
      stiffness: 100,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2
    }));
  }, [number, delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

const getBallColor = (number: number) => {
  if (number <= 10) return 'bg-[#FFA726]';
  if (number <= 20) return 'bg-[#42A5F5]';
  if (number <= 30) return 'bg-[#EF5350]';
  if (number <= 40) return 'bg-[#9E9E9E]';
  return 'bg-[#66BB6A]';
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
