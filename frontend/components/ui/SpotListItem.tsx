import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { LottoSpot } from '../../api/types/spots';

interface SpotListItemProps {
  spot: LottoSpot;
}

/**
 * @description 명당 찾기 화면의 리스트 뷰에서 개별 판매점의 정보를 표시하는 아이템 컴포넌트입니다.
 */
function SpotListItemComponent({ spot }: SpotListItemProps) {
  return (
    <View
      className="bg-white rounded-[24px] p-5 mb-1 flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View className="bg-[#4CAF50]/10 p-4 rounded-[18px] mr-4">
        <MapPin size={24} color="#4CAF50" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[17px] text-[#1A1A1A]">{spot.name}</Text>
        <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[13px] mt-1" numberOfLines={1}>
          {spot.address}
        </Text>
        <View className="flex-row gap-2 mt-3">
          <View className="bg-[#FFC107]/10 px-2.5 py-1.5 rounded-lg border border-[#FFC107]/30">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#FFC107] text-[11px]">1등 {spot.firstPlaceWins}회</Text>
          </View>
          <View className="bg-[#BDBDBD]/10 px-2.5 py-1.5 rounded-lg border border-[#BDBDBD]/30">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#757575] text-[11px]">2등 {spot.secondPlaceWins}회</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#E0E0E0" />
    </View>
  );
}

export const SpotListItem = memo(SpotListItemComponent);
