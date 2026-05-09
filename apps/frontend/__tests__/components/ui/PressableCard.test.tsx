import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PressableCard } from '../../../components/ui/PressableCard';

describe('PressableCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <PressableCard onPress={jest.fn()}><Text>안</Text></PressableCard>
    );
    expect(getByText('안')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <PressableCard onPress={onPress} accessibilityLabel="카드"><Text>x</Text></PressableCard>
    );
    fireEvent.press(getByLabelText('카드'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
