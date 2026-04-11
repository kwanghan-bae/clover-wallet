import React from 'react';
import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { GenerationResult } from '../../../components/generation/GenerationResult';

jest.mock('../../../utils/lotto', () => ({
  getNumberColor: (n: number) => n <= 10 ? 'bg-yellow-400' : 'bg-blue-400',
}));

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('GenerationResult', () => {
  const mockScaleAnim = new Animated.Value(1);
  const defaultProps = {
    numbers: [] as number[],
    methodTitle: undefined as string | undefined,
    scaleAnim: mockScaleAnim,
    isSaving: false,
    onSave: jest.fn(),
    onShare: jest.fn(),
  };

  /** 번호가 없으면 안내 메시지를 표시합니다 */
  test('번호가 없으면 안내 메시지를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(GenerationResult, defaultProps)
    );
    expect(hasText(toJSON(), '아래에서 생성 방식을 선택하세요!')).toBe(true);
  });

  /** 번호가 있으면 번호를 표시합니다 */
  test('생성된 번호를 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(GenerationResult, { ...defaultProps, numbers: [7, 14, 21, 28, 35, 42] })
    );
    const tree = toJSON();
    expect(hasText(tree, '"7"')).toBe(true);
    expect(hasText(tree, '"42"')).toBe(true);
  });

  /** 메서드 타이틀을 표시합니다 */
  test('선택된 방식 이름을 뱃지로 표시한다', () => {
    const { toJSON } = render(
      React.createElement(GenerationResult, { ...defaultProps, numbers: [1, 2, 3, 4, 5, 6], methodTitle: '꿈 해몽' })
    );
    expect(hasText(toJSON(), '꿈 해몽')).toBe(true);
  });

  /** 저장/공유 버튼을 표시합니다 */
  test('번호가 있으면 저장/공유 버튼을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(GenerationResult, { ...defaultProps, numbers: [1, 2, 3, 4, 5, 6] })
    );
    const tree = toJSON();
    expect(hasText(tree, '번호 저장하기')).toBe(true);
    expect(hasText(tree, '커뮤니티에 공유')).toBe(true);
  });

  /** 저장 중 상태를 표시합니다 */
  test('저장 중에는 저장 중 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(GenerationResult, { ...defaultProps, numbers: [1, 2, 3, 4, 5, 6], isSaving: true })
    );
    expect(hasText(toJSON(), '저장 중')).toBe(true);
  });
});
