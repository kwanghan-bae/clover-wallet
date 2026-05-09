import React, { memo } from 'react';
import { View } from 'react-native';
import { Trophy, Calendar } from 'lucide-react-native';
import { AppText } from './AppText';
import { WinningHistory } from '../../api/types/spots';

interface WinningHistoryItemProps {
  item: WinningHistory;
}

/**
 * @description 판매점 상세 화면에서 회차별 당첨 이력을 표시하는 아이템 컴포넌트입니다.
 */
const WinningHistoryItemComponent = ({ item }: WinningHistoryItemProps) => {
  const is1st = item.rank === 1;

  return (
    <View className="bg-surface rounded-card p-5 mb-4 flex-row items-center border border-border-hairline shadow-sm">
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${is1st ? 'bg-[#FFC107]/10' : 'bg-[#4CAF50]/10'}`}>
        <Trophy size={20} color={is1st ? '#FFC107' : '#4CAF50'} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <AppText variant="title" className="text-text-primary">
            {item.round}회 당첨
          </AppText>
          <AppText variant="title" className={`text-[14px] ${is1st ? 'text-[#FFC107]' : 'text-primary-text'}`}>
            {item.rank}등
          </AppText>
        </View>
        <View className="flex-row items-center">
          <Calendar size={12} color="#BDBDBD" />
          <AppText variant="body" className="text-text-muted text-[12px] ml-1">
            {item.method || "자동"}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export const WinningHistoryItem = memo(WinningHistoryItemComponent);
WinningHistoryItem.displayName = 'WinningHistoryItem';
