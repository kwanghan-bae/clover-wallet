import React from 'react';
import { View, Text } from 'react-native';
import { Trophy, Calendar } from 'lucide-react-native';
import { WinningHistory } from '../../api/types/spots';

interface WinningHistoryItemProps {
  item: WinningHistory;
}

/** 
 * @description 판매점 상세 화면에서 회차별 당첨 이력을 표시하는 아이템 컴포넌트입니다. 
 */
export function WinningHistoryItem({ item }: WinningHistoryItemProps) {
  const is1st = item.rank === 1;
  
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 flex-row items-center border border-gray-50 shadow-sm">
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${is1st ? 'bg-[#FFC107]/10' : 'bg-[#4CAF50]/10'}`}>
        <Trophy size={20} color={is1st ? '#FFC107' : '#4CAF50'} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-base text-[#1A1A1A]">
            {item.round}회 당첨
          </Text>
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className={`text-sm ${is1st ? 'text-[#FFC107]' : 'text-[#4CAF50]'}`}>
            {item.rank}등
          </Text>
        </View>
        <View className="flex-row items-center">
          <Calendar size={12} color="#BDBDBD" />
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs ml-1">
            {item.method || "자동"}
          </Text>
        </View>
      </View>
    </View>
  );
}
