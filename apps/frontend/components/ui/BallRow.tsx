import React from 'react';
import { View } from 'react-native';
import { LottoBall } from './LottoBall';
import { cn } from '../../utils/cn';

interface BallRowProps {
  numbers: number[];
  className?: string;
}

/** @description 로또 번호 세트를 일렬로 정렬하여 애니메이션과 함께 표시하는 행 컴포넌트입니다. */
export const BallRow = ({ numbers, className }: BallRowProps) => {
  return (
    <View className={cn("flex-row justify-between items-center", className)}>
      {numbers.map((num, idx) => (
        <LottoBall key={`${num}-${idx}`} number={num} delay={idx * 100} />
      ))}
    </View>
  );
};
