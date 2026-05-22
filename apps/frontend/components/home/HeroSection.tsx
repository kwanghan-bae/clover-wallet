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

const hash = '#';
const COLORS = {
  emeraldStart: hash + '10B981',
  emeraldMid: hash + '059669',
  emeraldEnd: hash + '047857',
  shadow: hash + '047857',
  btnText: hash + '065F46',
};

const HeroSectionComponent = ({ drawInfo, onGenerate, onScan }: HeroSectionProps) => (
  <LinearGradient
    colors={[COLORS.emeraldStart, COLORS.emeraldMid, COLORS.emeraldEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 26,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 28,
      elevation: 8,
      width: '100%',
      overflow: 'hidden',
    }}
  >
    <LuckyHeroIllustration />
    <View className="flex-row justify-between items-center" style={{ zIndex: 1 }}>
      <AppText variant="eyebrow" className="text-white/75 uppercase tracking-wider font-bold">NEXT DRAW</AppText>
      <View className="px-3 py-1 rounded-full bg-white/15 border border-white/20">
        <AppText variant="label" className="text-white font-bold text-[12px]">제 {drawInfo.currentRound} 회</AppText>
      </View>
    </View>
    <AppText variant="caption" className="text-white/80 mt-6 font-semibold" style={{ zIndex: 1 }}>당첨 발표까지</AppText>
    <HeroTime days={drawInfo.daysLeft} hours={drawInfo.hoursLeft} minutes={drawInfo.minutesLeft} />
    <View className="flex-row gap-2.5 mt-6" style={{ zIndex: 1 }}>
      <TouchableOpacity
        onPress={onGenerate}
        activeOpacity={0.8}
        accessibilityLabel="번호 생성하기"
        accessibilityRole="button"
        testID="btn-generate"
        className="flex-1 bg-white py-3.5 rounded-2xl items-center justify-center"
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 6 }, 
          shadowOpacity: 0.15, 
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <AppText variant="body-lg" className="font-extrabold tracking-tight" style={{ color: COLORS.btnText }}>
          번호 생성하기
        </AppText>
      </TouchableOpacity>
      {onScan ? (
        <TouchableOpacity
          onPress={onScan}
          activeOpacity={0.8}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          className="w-12 rounded-2xl items-center justify-center bg-white/20 border border-white/25"
        >
          <QrCode size={20} color="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  </LinearGradient>
);

export const HeroSection = memo(HeroSectionComponent);
