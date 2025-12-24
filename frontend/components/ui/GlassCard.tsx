import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

export const GlassCard = ({ 
  children, 
  className = "", 
  opacity = 0.15, 
  blur = 10,
  borderRadius = 24 
}: GlassCardProps) => {
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
        tint="light"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          padding: 24,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {children}
      </BlurView>
    </View>
  );
};
