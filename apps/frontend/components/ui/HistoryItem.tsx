import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Calendar } from 'lucide-react-native';
import { LottoBall } from './LottoBall';
import { LottoSetRecord } from '../../api/types/lotto';
import { labelOf } from '../../utils/lotto';

interface HistoryItemProps {
  record: LottoSetRecord;
  onDelete: (id: number) => void;
}

/** @description 사용자의 과거 로또 구매 또는 번호 생성 내역 카드. 단일/N게임 묶음 모두 처리. */
const HistoryItemComponent = ({ record, onDelete }: HistoryItemProps) => {
  const dateStr = formatDate(record.createdAt);
  const isMulti = record.games.length > 1;

  return (
    <View
      className="bg-white rounded-[24px] p-5 mb-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          {record.round ? (
            <View className="bg-[#4CAF50]/10 px-3 py-1.5 rounded-xl">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-[12px]">
                {record.round}회차
              </Text>
            </View>
          ) : null}
          {isMulti ? (
            <View className="bg-primary/10 px-3 py-1.5 rounded-xl">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-primary text-[12px]">
                {record.games.length}게임 묶음
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center ml-1">
            <Calendar size={14} color="#BDBDBD" />
            <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[12px] ml-1.5">
              {dateStr}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(record.id)}
          className="p-1"
          activeOpacity={0.6}
          accessibilityLabel="내역 삭제"
          accessibilityRole="button"
        >
          <Trash2 size={18} color="#FFCDCD" />
        </TouchableOpacity>
      </View>

      {record.games.map((game, i) => (
        <View key={i} className={i > 0 ? 'mt-3' : ''}>
          {isMulti ? (
            <Text className="text-gray-400 font-bold text-[12px] mb-1.5 ml-1">{labelOf(i)}</Text>
          ) : null}
          <View className="flex-row justify-between items-center px-1">
            {game.numbers.map((num, j) => (
              <LottoBall key={j} number={num} size="sm" />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export const HistoryItem = memo(HistoryItemComponent);
HistoryItem.displayName = 'HistoryItem';

function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return String(date);
  }
}
