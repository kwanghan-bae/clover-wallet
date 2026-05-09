import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { LuckyHeroIllustration } from '../ui/LuckyHeroIllustration';
import { HeroTime } from './HeroTime';

export interface DrawInfo {
  currentRound: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
}

export interface HeroSectionProps {
  drawInfo: DrawInfo;
  onGenerate: () => void;
  onScan?: () => void;
}

const HeroSectionComponent = ({ drawInfo, onGenerate, onScan }: HeroSectionProps) => (
  <LinearGradient
    colors={['#4CAF50', '#388E3C', '#2E7D32']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 26,
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      shadowRadius: 28,
      elevation: 8,
      width: '100%',
      overflow: 'hidden',
    }}
  >
    <LuckyHeroIllustration />
    <View className="flex-row justify-between items-center" style={{ zIndex: 1 }}>
      <AppText variant="eyebrow" className="text-white/75 uppercase">NEXT DRAW</AppText>
      <View className="px-2.5 py-1 rounded-pill bg-white/15 border border-white/25">
        <AppText variant="label" className="text-white">제 {drawInfo.currentRound} 회</AppText>
      </View>
    </View>
    <AppText variant="caption" className="text-white/85 mt-7" style={{ zIndex: 1 }}>당첨 발표까지</AppText>
    <HeroTime days={drawInfo.daysLeft} hours={drawInfo.hoursLeft} minutes={drawInfo.minutesLeft} />
    <View className="flex-row gap-2 mt-5" style={{ zIndex: 1 }}>
      <TouchableOpacity
        onPress={onGenerate}
        activeOpacity={0.7}
        accessibilityLabel="번호 생성하기"
        accessibilityRole="button"
        testID="btn-generate"
        className="flex-1 bg-white py-3.5 rounded-lg items-center"
        style={{ shadowColor: '#0F1115', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 }}
      >
        <AppText variant="body-lg" className="text-primary-text">번호 생성하기</AppText>
      </TouchableOpacity>
      {onScan ? (
        <TouchableOpacity
          onPress={onScan}
          activeOpacity={0.7}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          className="w-12 rounded-lg items-center justify-center bg-white/18 border border-white/25"
        >
          <QrCode size={18} color="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  </LinearGradient>
);

export const HeroSection = memo(HeroSectionComponent);
