import React, { memo } from 'react';
import { View } from 'react-native';
import { METHODS } from '../../constants/generation-methods';
import { GenerationMethodCard } from '../ui/GenerationMethodCard';
import { AppText } from '../ui/AppText';

export interface MethodSelectorProps {
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

/** @description 번호 생성 방식을 선택하는 카드 목록 컴포넌트입니다. */
const MethodSelectorComponent = ({ selectedMethod, onSelect }: MethodSelectorProps) => (
  <>
    <AppText variant="title-lg" className="text-text-primary dark:text-dark-text mt-10 mb-2">
      추첨 방식 선택
    </AppText>
    <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary mb-6">
      다양한 방법으로 행운의 번호를 찾아보세요!
    </AppText>
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
