import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface GenerationMethodCardProps {
  method: {
    id: string;
    title: string;
    subtitle: string;
    color: string;
    icon: React.ReactNode;
  };
  isSelected: boolean;
  onPress: () => void;
}

/**
 * @description 번호 생성 화면에서 각 추첨 방식(방법론)을 표시하는 카드 컴포넌트입니다.
 */
const GenerationMethodCardComponent = ({ method, isSelected, onPress }: GenerationMethodCardProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-white rounded-2xl p-4 flex-row items-center border ${isSelected ? 'border-primary shadow-md' : 'border-gray-50 shadow-sm'}`}
    >
      <View style={{ backgroundColor: method.color }} className="p-3 rounded-xl mr-4 shadow-sm">
        {method.icon}
      </View>
      <View className="flex-1">
        <Text className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-[#1A1A1A]'}`}>
          {method.title}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">{method.subtitle}</Text>
      </View>
      {isSelected && (
        <View className="bg-primary/10 p-1 rounded-full">
          <Sparkles size={16} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const GenerationMethodCard = memo(GenerationMethodCardComponent);
GenerationMethodCard.displayName = 'GenerationMethodCard';
