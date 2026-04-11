import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeroSection } from '../../../components/home/HeroSection';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('HeroSection', () => {
  const mockDrawInfo = {
    currentRound: 1103,
    daysLeft: 3,
    hoursLeft: 4,
    minutesLeft: 20,
  };
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  /** 회차 정보를 표시합니다 */
  test('회차 번호를 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(HeroSection, { drawInfo: mockDrawInfo, onGenerate: mockOnGenerate })
    );
    expect(hasText(toJSON(), '1103')).toBe(true);
  });

  /** 카운트다운 및 텍스트를 표시합니다 */
  test('발표 안내 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(HeroSection, { drawInfo: mockDrawInfo, onGenerate: mockOnGenerate })
    );
    expect(hasText(toJSON(), '당첨 발표까지')).toBe(true);
  });

  /** 번호 생성 버튼을 표시하고 클릭 이벤트를 처리합니다 */
  test('번호 생성 버튼을 누르면 onGenerate가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(HeroSection, { drawInfo: mockDrawInfo, onGenerate: mockOnGenerate })
    );
    fireEvent.press(getByLabelText('번호 생성하기'));
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  /** 접근성 속성이 올바르게 설정되어야 합니다 */
  test('번호 생성 버튼에 올바른 접근성 레이블을 가진다', () => {
    const { getByLabelText } = render(
      React.createElement(HeroSection, { drawInfo: mockDrawInfo, onGenerate: mockOnGenerate })
    );
    expect(getByLabelText('번호 생성하기')).toBeTruthy();
  });
});
