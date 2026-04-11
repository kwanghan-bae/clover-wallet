import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MethodSelector } from '../../../components/generation/MethodSelector';

jest.mock('../../../components/ui/GenerationMethodCard', () => ({
  GenerationMethodCard: (props: any) => {
    const RN = require('react-native');
    return React.createElement(
      RN.TouchableOpacity, { onPress: props.onPress, accessibilityLabel: props.method.title },
      React.createElement(RN.Text, null, props.method.title)
    );
  },
}));

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('MethodSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  /** 섹션 제목을 표시합니다 */
  test('추첨 방식 선택 제목을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(MethodSelector, { selectedMethod: '', onSelect: mockOnSelect })
    );
    const tree = toJSON();
    expect(hasText(tree, '추첨 방식 선택')).toBe(true);
    expect(hasText(tree, '다양한 방법으로 행운의 번호를 찾아보세요!')).toBe(true);
  });

  /** 모든 메서드 카드를 렌더링합니다 */
  test('모든 생성 방식 카드를 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(MethodSelector, { selectedMethod: '', onSelect: mockOnSelect })
    );
    const tree = toJSON();
    expect(hasText(tree, '꿈 해몽')).toBe(true);
    expect(hasText(tree, '사주팔자')).toBe(true);
    expect(hasText(tree, '통계 (HOT)')).toBe(true);
    expect(hasText(tree, '별자리 운세')).toBe(true);
  });

  /** 카드를 누르면 onSelect가 호출됩니다 */
  test('방식을 선택하면 onSelect가 올바른 ID로 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(MethodSelector, { selectedMethod: '', onSelect: mockOnSelect })
    );
    fireEvent.press(getByLabelText('꿈 해몽'));
    expect(mockOnSelect).toHaveBeenCalledWith('DREAM');
  });
});
