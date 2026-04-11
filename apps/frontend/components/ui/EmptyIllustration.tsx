import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * 고품질 프리미엄 "Empty State" 일러스트 컴포넌트 (Figma Style)
 */
export const EmptyIllustration = ({ color = "#4CAF50" }: { color?: string }) => (
  <View className="items-center justify-center">
    <Svg width="220" height="180" viewBox="0 0 220 180" fill="none">
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      
      {/* Background soft glow */}
      <Circle cx="110" cy="90" r="80" fill="url(#grad)" />
      
      {/* Abstract premium ticket shapes */}
      <G opacity="0.8">
        <Rect x="70" y="45" width="80" height="110" rx="12" fill="white" stroke={color} strokeWidth="1.5" />
        <Path d="M85 70H135" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <Path d="M85 90H120" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <Path d="M85 110H130" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        
        {/* Decorative dots and sparkles */}
        <Circle cx="140" cy="60" r="3" fill="#FFC107" />
        <Path d="M40 100L44 104L40 108L36 104L40 100Z" fill={color} opacity="0.4" />
        <Circle cx="180" cy="80" r="5" fill="#2196F3" opacity="0.2" />
      </G>

      {/* Floating Clover Leaf */}
      <Path 
        d="M110 30C110 30 115 20 120 20C125 20 130 25 130 30C130 35 125 40 110 40C95 40 90 35 90 30C90 25 95 20 100 20C105 20 110 30 110 30Z" 
        fill={color} 
        opacity="0.6"
      />
    </Svg>
  </View>
);

