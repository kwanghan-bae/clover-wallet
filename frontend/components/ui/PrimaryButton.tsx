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
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#E0E0E0', '#BDBDBD'] : ['#66BB6A', '#43A047']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-4 px-6 items-center justify-center flex-row space-x-2"
      >
        {isLoading && <ActivityIndicator color="white" size="small" className="mr-2" />}
        <Text className={cn("text-white font-bold text-lg", textClassName)}>
          {label}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};
