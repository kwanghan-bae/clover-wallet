import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanResultView } from '../../../components/scan/ScanResultView';

jest.mock('../../../components/ui/BallRow', () => ({
  BallRow: (props: any) => {
    const RN = require('react-native');
    return React.createElement(RN.View, null,
      React.createElement(RN.Text, null, props.numbers.join(','))
    );
  },
}));

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('ScanResultView', () => {
  const mockResult = { numbers: [1, 5, 12, 25, 33, 45], round: 1103 };
  const mockOnRetry = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** 스캔 결과 카드를 렌더링합니다 */
  test('인식된 번호 확인 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanResultView, { result: mockResult, onRetry: mockOnRetry, onConfirm: mockOnConfirm })
    );
    expect(hasText(toJSON(), '인식된 번호 확인')).toBe(true);
  });

  /** 회차 정보를 표시합니다 */
  test('회차 정보를 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanResultView, { result: mockResult, onRetry: mockOnRetry, onConfirm: mockOnConfirm })
    );
    const tree = toJSON();
    expect(hasText(tree, '1103')).toBe(true);
    expect(hasText(tree, '회차')).toBe(true);
  });

  /** 다시 촬영 텍스트를 표시합니다 */
  test('다시 촬영 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanResultView, { result: mockResult, onRetry: mockOnRetry, onConfirm: mockOnConfirm })
    );
    expect(hasText(toJSON(), '다시 촬영')).toBe(true);
  });

  /** 회차 정보 없이도 렌더링이 가능해야 합니다 */
  test('회차 정보 없이 렌더링한다', () => {
    const resultWithoutRound = { numbers: [1, 5, 12, 25, 33, 45] };
    const { toJSON } = render(
      React.createElement(ScanResultView, { result: resultWithoutRound, onRetry: mockOnRetry, onConfirm: mockOnConfirm })
    );
    const tree = toJSON();
    expect(hasText(tree, '인식된 번호 확인')).toBe(true);
    expect(hasText(tree, '회차')).toBe(false);
  });

  /** 안내 문구를 표시합니다 */
  test('주의 문구를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ScanResultView, { result: mockResult, onRetry: mockOnRetry, onConfirm: mockOnConfirm })
    );
    expect(hasText(toJSON(), '인식된 번호가 정확한지 확인해주세요')).toBe(true);
  });
});
