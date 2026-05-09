import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionCard } from '../../../components/ui/QuickActionCard';

describe('QuickActionCard', () => {
  it('renders icon + label', () => {
    const { getByText } = render(
      <QuickActionCard icon={<Text>🎲</Text>} label="번호 추첨" tone="green" onPress={jest.fn()} />
    );
    expect(getByText('🎲')).toBeTruthy();
    expect(getByText('번호 추첨')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <QuickActionCard icon={<Text>🎲</Text>} label="번호 추첨" tone="green" onPress={onPress} />
    );
    fireEvent.press(getByLabelText('번호 추첨'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
