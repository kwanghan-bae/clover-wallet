import React from 'react';
import { View } from 'react-native';
import { LottoBall } from './LottoBall';
import { cn } from '../../utils/cn';

interface BallRowProps {
  numbers: number[];
  className?: string;
}

export const BallRow = ({ numbers, className }: BallRowProps) => {
  return (
    <View className={cn("flex-row justify-between items-center", className)}>
      {numbers.map((num, idx) => (
        <LottoBall key={`${num}-${idx}`} number={num} delay={idx * 100} />
      ))}
    </View>
  );
};
