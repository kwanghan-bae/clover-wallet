import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActions } from '../../../components/home/QuickActions';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('QuickActions', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  /** 5개 퀵 액션 라벨을 모두 표시합니다 */
  test('5개 액션 라벨을 모두 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(QuickActions, { onNavigate: mockOnNavigate })
    );
    const tree = toJSON();
    expect(hasText(tree, '번호 추첨')).toBe(true);
    expect(hasText(tree, 'QR 스캔')).toBe(true);
    expect(hasText(tree, '번호 분석')).toBe(true);
    expect(hasText(tree, '명당 지도')).toBe(true);
    expect(hasText(tree, '로또 명당')).toBe(true);
  });

  /** 빠른 실행 섹션 제목을 표시합니다 */
  test('빠른 실행 섹션 제목을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(QuickActions, { onNavigate: mockOnNavigate })
    );
    expect(hasText(toJSON(), '빠른 실행')).toBe(true);
  });

  /** 액션을 누르면 올바른 경로로 onNavigate가 호출됩니다 */
  test('번호 추첨을 누르면 올바른 경로로 이동한다', () => {
    const { getByLabelText } = render(
      React.createElement(QuickActions, { onNavigate: mockOnNavigate })
    );
    fireEvent.press(getByLabelText('번호 추첨'));
    expect(mockOnNavigate).toHaveBeenCalledWith('/number-generation');
  });

  /** QR 스캔을 누르면 scan 경로로 이동합니다 */
  test('QR 스캔을 누르면 올바른 경로로 이동한다', () => {
    const { getByLabelText } = render(
      React.createElement(QuickActions, { onNavigate: mockOnNavigate })
    );
    fireEvent.press(getByLabelText('QR 스캔'));
    expect(mockOnNavigate).toHaveBeenCalledWith('/scan');
  });
});
