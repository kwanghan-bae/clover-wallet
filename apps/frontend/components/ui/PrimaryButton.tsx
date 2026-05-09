import React from 'react';
import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppText } from './AppText';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton = ({
  label,
  isLoading = false,
  className,
  textClassName,
  disabled,
  ...props
}: PrimaryButtonProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={isLoading || disabled}
      className={cn('rounded-lg overflow-hidden shadow-button', className)}
      style={animatedStyle}
      accessible
      accessibilityLabel={isLoading ? `${label} 처리 중` : label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(isLoading || disabled), busy: isLoading }}
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#E0E0E0', '#BDBDBD'] : ['#4CAF50', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-4 px-6 items-center justify-center flex-row"
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <AppText variant="body-lg" className={cn('text-white', textClassName)}>
            {label}
          </AppText>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};
