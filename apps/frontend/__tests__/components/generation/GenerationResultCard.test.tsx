import React from 'react';
import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { GenerationResultCard } from '../../../components/generation/GenerationResultCard';

describe('GenerationResultCard', () => {
  const numbers = [3, 7, 12, 19, 28, 41];
  const scaleAnim = new Animated.Value(1);

  test('6번호 모두 렌더', () => {
    const { getByText } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} />,
    );
    numbers.forEach((n) => {
      expect(getByText(String(n))).toBeTruthy();
    });
  });

  test('label 있을 때만 라벨 표시', () => {
    const { getByText } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} label="A" />,
    );
    expect(getByText('A')).toBeTruthy();
  });

  test('label 없으면 알파벳 텍스트도 없음', () => {
    const { queryByText } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} />,
    );
    expect(queryByText('A')).toBeNull();
  });
});
