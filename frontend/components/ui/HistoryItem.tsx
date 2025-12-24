import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Calendar } from 'lucide-react-native';
import { LottoBall } from './LottoBall';
import { LottoRecord } from '../../api/types/lotto';
import { cn } from '../../utils/cn';

interface HistoryItemProps {
  record: LottoRecord;
  onDelete: (id: string) => void;
}

export const HistoryItem = ({ record, onDelete }: HistoryItemProps) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-primary/10 px-2 py-1 rounded">
            <Text className="text-primary font-bold text-xs">Round {record.round}</Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={12} color="#757575" />
            <Text className="text-text-light text-xs ml-1">
              {new Date(record.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(record.id)}>
          <Trash2 size={18} color="#FF7272" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row justify-between">
        {record.numbers.map((num, i) => (
          <LottoBall key={i} number={num} size="sm" />
        ))}
      </View>
    </View>
  );
};
