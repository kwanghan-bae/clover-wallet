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
  return (
    <View className="bg-surface rounded-card-lg p-5 mb-1 flex-row items-center shadow-card">
      <View className="bg-[#4CAF50]/10 p-4 rounded-card mr-4">
        <MapPin size={24} color="#4CAF50" />
      </View>
      <View className="flex-1">
        <AppText variant="title" className="text-text-primary">{spot.name}</AppText>
        <AppText variant="body" className="text-text-muted mt-1" numberOfLines={1}>
          {spot.address}
        </AppText>
        <View className="flex-row gap-2 mt-3">
          <View className="bg-[#FFC107]/10 px-2.5 py-1.5 rounded-lg border border-[#FFC107]/30">
            <AppText variant="label" className="text-[#FFC107]">1등 {spot.firstPlaceWins}회</AppText>
          </View>
          <View className="bg-[#BDBDBD]/10 px-2.5 py-1.5 rounded-lg border border-[#BDBDBD]/30">
            <AppText variant="label" className="text-text-muted">2등 {spot.secondPlaceWins}회</AppText>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#E0E0E0" />
    </View>
  );
}

export const SpotListItem = memo(SpotListItemComponent);
SpotListItem.displayName = 'SpotListItem';
