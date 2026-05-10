import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '../ui/AppText';

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
  <View className="flex-row bg-surface dark:bg-dark-card rounded-card p-1 mb-4 shadow-card">
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
          className={`flex-1 py-3 rounded-lg items-center ${
            selected ? 'bg-primary' : ''
          }`}
        >
          <AppText
            variant="body-lg"
            className={selected ? 'text-white' : 'text-text-primary dark:text-dark-text'}
          >
            {label}
          </AppText>
          {sub ? (
            <AppText
              variant="label"
              className={`mt-0.5 ${selected ? 'text-white/80' : 'text-text-muted'}`}
            >
              {sub}
            </AppText>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </View>
);
