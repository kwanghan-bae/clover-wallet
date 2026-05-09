import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type GameCount = 1 | 5 | 10;

interface GameCountToggleProps {
  value: GameCount;
  onChange: (count: GameCount) => void;
}

const OPTIONS: { count: GameCount; label: string; sub?: string }[] = [
  { count: 1, label: '1게임' },
  { count: 5, label: '5게임', sub: '5천원' },
  { count: 10, label: '10게임', sub: '만원' },
];

/**
 * @description 한 번에 생성할 게임 수 선택 (1/5/10). 화면 상단 sticky로 배치.
 */
export const GameCountToggle = ({ value, onChange }: GameCountToggleProps) => (
  <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-1 mb-4 shadow-sm">
    {OPTIONS.map(({ count, label, sub }) => {
      const selected = value === count;
      return (
        <TouchableOpacity
          key={count}
          onPress={() => onChange(count)}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected }}
          activeOpacity={0.7}
          className={`flex-1 py-3 rounded-xl items-center ${
            selected ? 'bg-primary' : ''
          }`}
        >
          <Text
            className={`font-bold text-[14px] ${
              selected ? 'text-white' : 'text-[#1A1A1A] dark:text-dark-text'
            }`}
          >
            {label}
          </Text>
          {sub ? (
            <Text
              className={`text-[11px] mt-0.5 ${
                selected ? 'text-white/80' : 'text-gray-400'
              }`}
            >
              {sub}
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </View>
);
