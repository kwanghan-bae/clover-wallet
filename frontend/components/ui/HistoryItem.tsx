import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Calendar } from 'lucide-react-native';
import { LottoBall } from './LottoBall';
import { LottoRecord } from '../../api/types/lotto';

interface HistoryItemProps {
  record: LottoRecord;
  onDelete: (id: string) => void;
}

export const HistoryItem = ({ record, onDelete }: HistoryItemProps) => {
  const dateStr = formatDate(record.createdAt);

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
          <View className="bg-[#4CAF50]/10 px-3 py-1.5 rounded-xl">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-[12px]">
              {record.round}회차
            </Text>
          </View>
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
        >
          <Trash2 size={18} color="#FFCDCD" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center px-1">
        {record.numbers.map((num, i) => (
          <LottoBall key={i} number={num} size="sm" />
        ))}
      </View>
    </View>
  );
};

function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch (e) {
    return String(date);
  }
}
