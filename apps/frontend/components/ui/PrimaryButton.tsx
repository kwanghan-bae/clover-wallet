import React from 'react';
import { Text, Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * @description 애플리케이션 전반에서 사용되는 주요 액션 버튼 컴포넌트입니다.
 * 애니메이션 피드백(Scale 효과)과 그라데이션 스타일을 제공합니다.
 */
export const PrimaryButton = ({ 
  label, 
  isLoading = false, 
  className, 
  textClassName,
  disabled,
  ...props 
}: PrimaryButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading || disabled}
      className={cn("rounded-xl overflow-hidden shadow-md", className)}
      style={animatedStyle}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(isLoading || disabled) }}
      {...props}
      onPress={isLoading || disabled ? undefined : props.onPress}
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
          <Text className={cn("text-white font-black text-base tracking-wide", textClassName)}>
            {label}
          </Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};
