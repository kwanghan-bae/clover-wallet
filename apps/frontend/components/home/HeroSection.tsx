import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LuckyHeroIllustration from '../ui/LuckyHeroIllustration';

export interface DrawInfo {
  currentRound: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
}

export interface HeroSectionProps {
  drawInfo: DrawInfo;
  onGenerate: () => void;
}

/** @description 홈 화면 상단 그라디언트 히어로 카드 (카운트다운 + 번호 생성 버튼) */
const HeroSectionComponent = ({ drawInfo, onGenerate }: HeroSectionProps) => (
  <LinearGradient
    colors={['#4CAF50', '#388E3C']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 5,
      width: '100%',
      alignItems: 'center',
    }}
  >
    <LuckyHeroIllustration />
    <View
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
      }}
    >
      <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-xs">
        제 {drawInfo.currentRound} 회
      </Text>
    </View>

    <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="text-white/80 text-base mt-6">
      당첨 발표까지
    </Text>

    <Text
      style={{
        fontFamily: 'NotoSansKR_900Black',
        textShadowColor: 'rgba(0, 0, 0, 0.26)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        fontSize: 42,
        letterSpacing: -1.0,
        marginTop: 4,
        color: 'white',
      }}
    >
      {drawInfo.daysLeft}일 {drawInfo.hoursLeft}시간 {drawInfo.minutesLeft}분
    </Text>

    <TouchableOpacity
      onPress={onGenerate}
      activeOpacity={0.9}
      accessibilityLabel="번호 생성하기"
      accessibilityRole="button"
      testID="btn-generate"
      style={{
        backgroundColor: 'white',
        paddingHorizontal: 48,
        paddingVertical: 18,
        borderRadius: 30,
        marginTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <Text style={{ fontFamily: 'NotoSansKR_900Black' }} className="text-[#4CAF50] text-lg">
        번호 생성하기
      </Text>
    </TouchableOpacity>
  </LinearGradient>
);

export const HeroSection = memo(HeroSectionComponent);
