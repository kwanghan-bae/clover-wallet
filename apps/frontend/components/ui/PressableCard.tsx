import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface PressableCardProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  className,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => { scale.value = withSpring(0.98); onPressIn?.(e); }}
      onPressOut={(e) => { scale.value = withSpring(1); onPressOut?.(e); }}
      style={animatedStyle}
      className={cn('rounded-card-lg bg-surface shadow-card dark:bg-dark-card', className)}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
    >
      {children}
    </AnimatedPressable>
  );
};

PressableCard.displayName = 'PressableCard';
