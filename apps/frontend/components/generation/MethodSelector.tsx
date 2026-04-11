import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { METHODS } from '../../constants/generation-methods';
import { GenerationMethodCard } from '../ui/GenerationMethodCard';

export interface MethodSelectorProps {
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

/** @description 번호 생성 방식을 선택하는 카드 목록 컴포넌트입니다. */
const MethodSelectorComponent = ({ selectedMethod, onSelect }: MethodSelectorProps) => (
  <>
    <Text className="text-xl font-bold text-[#1A1A1A] dark:text-dark-text mt-10 mb-2">
      추첨 방식 선택
    </Text>
    <Text className="text-gray-500 dark:text-dark-text-secondary text-[13px] mb-6">
      다양한 방법으로 행운의 번호를 찾아보세요!
    </Text>
    <View className="gap-3">
      {METHODS.map((method) => (
        <GenerationMethodCard
          key={method.id}
          method={method}
          isSelected={selectedMethod === method.id}
          onPress={() => onSelect(method.id)}
        />
      ))}
    </View>
  </>
);

export const MethodSelector = memo(MethodSelectorComponent);
