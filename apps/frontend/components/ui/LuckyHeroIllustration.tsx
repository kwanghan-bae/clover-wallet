import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * 홈 화면 Hero 섹션에 들어갈 고품질 입체 일러스트 (Figma Style)
 */
export const LuckyHeroIllustration = () => (
  <View style={{ position: 'absolute', right: -30, bottom: -20 }}>
    <Svg width="200" height="200" viewBox="0 0 200 200" fill="none">
      <Defs>
        <LinearGradient id="hero_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      <G opacity="0.6">
        {/* Large glass clover shape */}
        <Path 
          d="M100 40C100 40 115 10 135 10C155 10 170 30 170 50C170 70 150 90 100 90C50 90 30 70 30 50C30 30 45 10 65 10C85 10 100 40 100 40Z" 
          fill="url(#hero_grad)" 
        />
        <Path 
          d="M100 120C100 120 115 150 135 150C155 150 170 130 170 110C170 90 150 70 100 70C50 70 30 90 30 110C30 130 45 150 65 150C85 150 100 120 100 120Z" 
          fill="url(#hero_grad)" 
        />
        {/* Golden core */}
        <Circle cx="100" cy="80" r="12" fill="#FFC107" opacity="0.8" />
        {/* Sparkles */}
        <Path d="M160 40L164 44L160 48L156 44L160 40Z" fill="white" />
        <Path d="M40 120L46 126L40 132L34 126L40 120Z" fill="white" opacity="0.5" />
      </G>
    </Svg>
  </View>
);