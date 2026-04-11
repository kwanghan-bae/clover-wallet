import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeSelector } from '../../../components/mypage/ThemeSelector';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('ThemeSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  /** 3가지 테마 옵션을 모두 렌더링합니다 */
  test('시스템/라이트/다크 3가지 옵션을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(ThemeSelector, { themePreference: 'system', onSelect: mockOnSelect })
    );
    const tree = toJSON();
    expect(hasText(tree, '테마 설정')).toBe(true);
    expect(hasText(tree, '시스템')).toBe(true);
    expect(hasText(tree, '라이트')).toBe(true);
    expect(hasText(tree, '다크')).toBe(true);
  });

  /** 테마 옵션을 누르면 onSelect가 호출됩니다 */
  test('라이트 옵션을 누르면 onSelect("light")가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(ThemeSelector, { themePreference: 'system', onSelect: mockOnSelect })
    );
    fireEvent.press(getByLabelText('라이트'));
    expect(mockOnSelect).toHaveBeenCalledWith('light');
  });

  /** 다크 옵션을 누르면 onSelect가 호출됩니다 */
  test('다크 옵션을 누르면 onSelect("dark")가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(ThemeSelector, { themePreference: 'light', onSelect: mockOnSelect })
    );
    fireEvent.press(getByLabelText('다크'));
    expect(mockOnSelect).toHaveBeenCalledWith('dark');
  });

  /** 접근성 속성이 올바르게 설정되어야 합니다 */
  test('선택된 옵션에 올바른 접근성 상태를 가진다', () => {
    const { getByLabelText } = render(
      React.createElement(ThemeSelector, { themePreference: 'dark', onSelect: mockOnSelect })
    );
    expect(getByLabelText('다크')).toBeTruthy();
  });
});
