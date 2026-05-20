import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

const getBallGradient = (num: number): [string, string] => {
  if (num <= 10) return ['#FFD54F', '#FF8F00']; // 1-10: Gold/Amber
  if (num <= 20) return ['#64B5F6', '#1565C0']; // 11-20: Blue
  if (num <= 30) return ['#E57373', '#C62828']; // 21-30: Red
  if (num <= 40) return ['#B0BEC5', '#37474F']; // 31-40: Cool Grey
  return ['#81C784', '#2E7D32']; // 41-45: Green
};

const getBallShadowColor = (num: number): string => {
  if (num <= 10) return 'rgba(255, 143, 0, 0.4)';
  if (num <= 20) return 'rgba(21, 101, 192, 0.4)';
  if (num <= 30) return 'rgba(198, 40, 40, 0.4)';
  if (num <= 40) return 'rgba(55, 71, 79, 0.4)';
  return 'rgba(46, 125, 50, 0.4)';
};

/** @description 개별 로또 번호를 3D 입체 광택 구체 모양으로 렌더링하며, 번호대에 따라 고급스러운 그라데이션을 설정하는 컴포넌트입니다. */
export const LottoBall = ({ number, size = 'md', delay = 0, className }: LottoBallProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, {
      damping: 12,
      mass: 0.8,
      stiffness: 100,
      overshootClamping: false,
    }));
  }, [number, delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-xs font-black',
    md: 'text-sm font-black',
    lg: 'text-lg font-black',
  };

  const shadowStyle = {
    shadowColor: getBallShadowColor(number),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  };

  return (
    <Animated.View 
      style={[animatedStyle, shadowStyle]}
      className={cn(
        "rounded-full border border-white/20 overflow-hidden", 
        sizeClasses[size],
        className
      )}
    >
      <LinearGradient
        colors={getBallGradient(number)}
        start={{ x: 0.15, y: 0.15 }}
        end={{ x: 0.85, y: 0.85 }}
        className="w-full h-full items-center justify-center relative"
      >
        {/* Glossy top-light reflection (creates 3D sphere look) */}
        <View 
          className="absolute top-[6%] left-[10%] w-[80%] h-[30%] rounded-full bg-white/25"
          style={{ transform: [{ scaleX: 1.1 }] }}
        />
        {/* Subtle bottom glow reflection */}
        <View 
          className="absolute bottom-[6%] left-[20%] w-[60%] h-[15%] rounded-full bg-white/10"
        />
        <Text 
          className={cn("text-white text-center", textSizeClasses[size])}
          style={{ 
            textShadowColor: 'rgba(0, 0, 0, 0.4)', 
            textShadowOffset: { width: 0.5, height: 1 }, 
            textShadowRadius: 1 
          }}
        >
          {number}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

