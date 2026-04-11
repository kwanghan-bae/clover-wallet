import React from 'react';
import { View, Text } from 'react-native';
import { LottoSpot } from '../../api/types/spots';

interface MapCalloutContentProps {
  spot?: LottoSpot;
}

/** 
 * @description 지도상의 핀을 클릭했을 때 나타나는 판매점 요약 정보를 담은 호출(Callout) 컴포넌트입니다.
 */
export function MapCalloutContent({ spot }: MapCalloutContentProps) {
  if (!spot) return null;
  return (
    <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg w-60">
      <Text className="text-lg font-bold text-text-dark mb-1">{spot.name}</Text>
      <Text className="text-text-light text-[11px] mb-2">{spot.address}</Text>
      <View className="flex-row gap-2">
        <View className="bg-primary/10 px-2 py-1 rounded">
          <Text className="text-primary font-bold text-[11px]">1등: {spot.firstPlaceWins}</Text>
        </View>
        <View className="bg-secondary/10 px-2 py-1 rounded">
          <Text className="text-secondary font-bold text-[11px]">2등: {spot.secondPlaceWins}</Text>
        </View>
      </View>
    </View>
  );
}
