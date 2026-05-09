import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { GenerationResultCards } from '../../../components/generation/GenerationResultCards';

describe('GenerationResultCards', () => {
  const scaleAnim = new Animated.Value(1);
  const baseProps = {
    methodTitle: '사주팔자',
    isSaving: false,
    onSave: jest.fn(),
    onShare: jest.fn(),
    scaleAnim,
  };

  beforeEach(() => jest.clearAllMocks());

  test('games=[] → 빈 상태 텍스트', () => {
    const { getByText } = render(
      <GenerationResultCards {...baseProps} games={[]} />,
    );
    expect(getByText('아래에서 생성 방식을 선택하세요!')).toBeTruthy();
  });

  test('games.length===1 → 라벨 없이 한 카드', () => {
    const games = [[1, 2, 3, 4, 5, 6]];
    const { queryByText, getByText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    games[0].forEach((n) => expect(getByText(String(n))).toBeTruthy());
    expect(queryByText('A')).toBeNull();
  });

  test('games.length===5 → 5개 카드 + 라벨 A~E', () => {
    const games = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18],
      [19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30],
    ];
    const { getByText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    ['A', 'B', 'C', 'D', 'E'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  test('저장 버튼 1쌍만 (5게임이어도)', () => {
    const games = Array.from({ length: 5 }, () => [1, 2, 3, 4, 5, 6]);
    const { getAllByLabelText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    expect(getAllByLabelText('번호 저장하기')).toHaveLength(1);
    expect(getAllByLabelText('커뮤니티에 공유')).toHaveLength(1);
  });

  test('저장 버튼 클릭 시 onSave 호출', () => {
    const games = [[1, 2, 3, 4, 5, 6]];
    const { getByLabelText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    fireEvent.press(getByLabelText('번호 저장하기'));
    expect(baseProps.onSave).toHaveBeenCalled();
  });
});
