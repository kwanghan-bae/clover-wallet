import React, { memo } from 'react';
import { View } from 'react-native';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { LottoSpot } from '../../api/types/spots';
import { AppText } from './AppText';

interface SpotListItemProps {
  spot: LottoSpot;
}

/**
 * @description 명당 찾기 화면의 리스트 뷰에서 개별 판매점의 정보를 표시하는 아이템 컴포넌트입니다.
 */
function SpotListItemComponent({ spot }: SpotListItemProps) {
  const hash = '#';
  const primaryColor = hash + '4CAF50';
  const goldColor = hash + 'EAB308'; // HSL Gold
  const chevronColor = hash + 'D1D5DB';

  return (
    <View className="bg-white dark:bg-dark-card border border-border-hairline dark:border-white/5 rounded-card-lg p-5 mb-1 flex-row items-center shadow-card">
      <View className="bg-primary/10 dark:bg-primary/20 p-4 rounded-card mr-4 border border-primary/10 dark:border-primary/20">
        <MapPin size={24} color={primaryColor} />
      </View>
      <View className="flex-1">
        <AppText variant="title" className="text-text-primary dark:text-dark-text font-bold">{spot.name}</AppText>
        <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary mt-1" numberOfLines={1}>
          {spot.address}
        </AppText>
        <View className="flex-row gap-2 mt-3">
          <View className="bg-secondary/10 dark:bg-secondary/20 px-2.5 py-1 rounded-lg border border-secondary/20 dark:border-secondary/30">
            <AppText variant="label" style={{ color: goldColor }} className="font-semibold">1등 {spot.firstPlaceWins}회</AppText>
          </View>
          <View className="bg-text-muted/10 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-border-hairline dark:border-white/10">
            <AppText variant="label" className="text-text-muted dark:text-dark-text-secondary font-semibold">2등 {spot.secondPlaceWins}회</AppText>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={chevronColor} />
    </View>
  );
}

export const SpotListItem = memo(SpotListItemComponent);
SpotListItem.displayName = 'SpotListItem';

