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
      activeOpacity={0.8}
      className={`flex-row items-center p-4 rounded-2xl border ${
        isSelected
          ? 'bg-white dark:bg-[#1E293B] border-transparent'
          : 'bg-white/70 dark:bg-[#1E293B]/60 border-black/[0.04] dark:border-white/[0.06]'
      }`}
      style={
        isSelected
          ? {
              borderColor: method.color,
              borderWidth: 1.5,
              shadowColor: method.color,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.22,
              shadowRadius: 10,
              elevation: 6,
            }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 1,
            }
      }
      accessibilityLabel={`${method.title}: ${method.subtitle}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={{ backgroundColor: method.color }} className="p-3 rounded-xl mr-4 shadow-sm">
        {method.icon}
      </View>
      <View className="flex-1">
        <Text className={`text-[16px] font-bold tracking-tight ${
          isSelected ? 'text-text-primary dark:text-white' : 'text-text-primary dark:text-dark-text'
        }`}>
          {method.title}
        </Text>
        <Text className="text-text-muted dark:text-dark-text-secondary text-[12px] mt-1 tracking-tight">
          {method.subtitle}
        </Text>
      </View>
      {isSelected && (
        <View 
          className="p-1.5 rounded-full"
          style={{ backgroundColor: method.color + '20' }}
        >
          <Sparkles size={15} color={method.color} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const GenerationMethodCard = memo(GenerationMethodCardComponent);
GenerationMethodCard.displayName = 'GenerationMethodCard';

