import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

/**
 * 현대적인 "Empty State" 일러스트 컴포넌트 (Figma/unDraw 스타일)
 */
export const EmptyIllustration = ({ color = "#4CAF50" }: { color?: string }) => (
  <View className="items-center justify-center">
    <Svg width="200" height="160" viewBox="0 0 200 160" fill="none">
      {/* Background shape */}
      <Circle cx="100" cy="80" r="70" fill={color} fillOpacity="0.05" />
      
      {/* Abstract paper/ticket shapes */}
      <Rect x="60" y="40" width="80" height="100" rx="8" fill="white" stroke={color} strokeWidth="2" />
      <Path d="M75 60H125" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M75 80H110" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M75 100H120" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* Floating lucky stars */}
      <Path d="M150 30L152 36L158 36L153 40L155 46L150 42L145 46L147 40L142 36L148 36L150 30Z" fill="#FFC107" />
      <Circle cx="40" cy="50" r="4" fill={color} />
      <Circle cx="160" cy="110" r="6" fill="#2196F3" fillOpacity="0.3" />
    </Svg>
  </View>
);
