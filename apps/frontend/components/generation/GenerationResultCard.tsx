import React, { memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { getNumberColor } from '../../utils/lotto';

interface GenerationResultCardProps {
  numbers: number[];
  scaleAnim: Animated.Value;
  label?: string;
}

/**
 * @description 단일 게임 결과 카드 (6번호 + 선택적 라벨).
 * GenerationResultCards에서 N개 묶어 표시할 때 각 카드 단위.
 */
const GenerationResultCardComponent = ({
  numbers,
  scaleAnim,
  label,
}: GenerationResultCardProps) => (
  <View className="bg-white/15 rounded-2xl p-4 mb-3 border border-white/20">
    {label ? (
      <View className="absolute -top-2 -left-1 bg-white px-2 py-0.5 rounded-full">
        <Text className="text-primary font-black text-[12px]">{label}</Text>
      </View>
    ) : null}
    <View className="flex-row flex-wrap justify-center gap-2">
      {numbers.map((n, idx) => (
        <Animated.View
          key={idx}
          style={{ transform: [{ scale: scaleAnim }] }}
          className={`${getNumberColor(n)} w-11 h-11 rounded-full items-center justify-center shadow-md`}
        >
          <Text className="text-white text-lg font-black">{n}</Text>
        </Animated.View>
      ))}
    </View>
  </View>
);

export const GenerationResultCard = memo(GenerationResultCardComponent);
