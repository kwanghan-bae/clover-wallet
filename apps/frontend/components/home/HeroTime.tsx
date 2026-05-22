import React from 'react';
import { View } from 'react-native';
import { AppText } from '../ui/AppText';

interface HeroTimeProps {
  days: number;
  hours: number;
  minutes: number;
}

const Segment = ({ value, unit }: { value: number; unit: string }) => (
  <View className="flex-row items-baseline bg-black/25 dark:bg-black/35 px-3 py-1.5 rounded-xl border border-white/10 mr-2">
    <AppText variant="display" className="text-white font-black tracking-tighter text-[26px] leading-none">
      {String(value).padStart(2, '0')}
    </AppText>
    <AppText variant="caption-sm" className="text-white/60 font-bold ml-1 text-[11px] uppercase">
      {unit}
    </AppText>
  </View>
);

export const HeroTime: React.FC<HeroTimeProps> = ({ days, hours, minutes }) => (
  <View className="flex-row items-center mt-2.5" style={{ zIndex: 1 }}>
    <Segment value={days} unit="일" />
    <Segment value={hours} unit="시간" />
    <Segment value={minutes} unit="분" />
  </View>
);
