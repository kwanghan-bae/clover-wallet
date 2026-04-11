import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

interface GlassCardProps extends ViewProps {
  opacity?: number;
  blur?: number;
  borderRadius?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * @description 투명한 유리 재질 느낌(Glassmorphism)의 카드 컴포넌트입니다.
 * 배경 블러 처리와 테두리 광택 효과를 통해 세련된 디자인을 제공합니다.
 */
export const GlassCard = ({
  children,
  className = "",
  opacity = 0.15,
  blur = 10,
  borderRadius = 24
}: GlassCardProps) => {
  const { isDark } = useTheme();
  const tint = isDark ? 'dark' : 'light';
  const bgColor = isDark
    ? `rgba(44, 44, 44, ${opacity + 0.5})`
    : `rgba(255, 255, 255, ${opacity})`;
  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.2)';

  return (
    <View
      className={`overflow-hidden ${className}`}
      style={{
        borderRadius,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 5 // Android fallback
      }}
    >
      <BlurView
        intensity={blur * 2}
        tint={tint}
        style={{
          backgroundColor: bgColor,
          padding: 24,
          borderWidth: 1.5,
          borderColor,
        }}
      >
        {children}
      </BlurView>
    </View>
  );
};
