import React from 'react';
import { View } from 'react-native';
import { LottoSpot } from '../../api/types/spots';
import { AppText } from './AppText';

interface MapCalloutContentProps {
  spot?: LottoSpot;
}

/**
 * @description 지도상의 핀을 클릭했을 때 나타나는 판매점 요약 정보를 담은 호출(Callout) 컴포넌트입니다.
 */
export function MapCalloutContent({ spot }: MapCalloutContentProps) {
  if (!spot) return null;
  return (
    <View className="bg-surface p-4 rounded-card-lg border border-border-hairline shadow-card w-60">
      <AppText variant="title" className="text-text-primary mb-1">{spot.name}</AppText>
      <AppText variant="label" className="text-text-muted mb-2">{spot.address}</AppText>
      <View className="flex-row gap-2">
        <View className="bg-primary/10 px-2 py-1 rounded-md">
          <AppText variant="label" className="text-primary">1등: {spot.firstPlaceWins}</AppText>
        </View>
        <View className="bg-secondary/10 px-2 py-1 rounded-md">
          <AppText variant="label" className="text-secondary">2등: {spot.secondPlaceWins}</AppText>
        </View>
      </View>
    </View>
  );
}
