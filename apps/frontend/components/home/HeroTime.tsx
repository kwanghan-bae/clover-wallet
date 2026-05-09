import React from 'react';
import { View } from 'react-native';
import { AppText } from '../ui/AppText';

interface HeroTimeProps {
  days: number;
  hours: number;
  minutes: number;
}

const Segment = ({ value, unit }: { value: number; unit: string }) => (
  <View className="flex-row items-baseline">
    <AppText variant="display" className="text-white">{value}</AppText>
    <AppText variant="body-lg" className="text-white/80 ml-1 mr-2">{unit}</AppText>
  </View>
);

export const HeroTime: React.FC<HeroTimeProps> = ({ days, hours, minutes }) => (
  <View className="flex-row items-baseline mt-1">
    <Segment value={days} unit="일" />
    <Segment value={hours} unit="시간" />
    <Segment value={minutes} unit="분" />
  </View>
);
