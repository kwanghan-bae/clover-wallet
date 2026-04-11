import React from 'react';
import { render } from '@testing-library/react-native';
import { BadgeSection } from '../../../components/mypage/BadgeSection';

/** 렌더 트리에서 특정 텍스트가 포함되어 있는지 확인합니다 */
function hasText(json: any, text: string): boolean {
  const str = JSON.stringify(json);
  return str.includes(text);
}

describe('BadgeSection', () => {
  /** 뱃지 키가 비어있으면 렌더링하지 않아야 합니다 */
  test('빈 뱃지 키일 때 null을 반환한다', () => {
    const { toJSON } = render(
      React.createElement(BadgeSection, { badgeKeys: '' })
    );
    expect(toJSON()).toBeNull();
  });

  /** 유효한 뱃지 키가 있으면 뱃지를 렌더링합니다 */
  test('유효한 뱃지 키를 올바르게 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(BadgeSection, { badgeKeys: 'first_win,passion' })
    );
    const tree = toJSON();
    expect(hasText(tree, '내 뱃지')).toBe(true);
    expect(hasText(tree, '첫 당첨')).toBe(true);
    expect(hasText(tree, '열정')).toBe(true);
  });

  /** 알 수 없는 뱃지 키는 무시해야 합니다 */
  test('알 수 없는 뱃지 키는 무시한다', () => {
    const { toJSON } = render(
      React.createElement(BadgeSection, { badgeKeys: 'first_win,unknown_key' })
    );
    const tree = toJSON();
    expect(hasText(tree, '첫 당첨')).toBe(true);
    expect(hasText(tree, 'unknown_key')).toBe(false);
  });

  /** 모든 4개 뱃지 유형을 렌더링할 수 있어야 합니다 */
  test('모든 뱃지 유형을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(BadgeSection, { badgeKeys: 'first_win,passion,verified,vip' })
    );
    const tree = toJSON();
    expect(hasText(tree, '첫 당첨')).toBe(true);
    expect(hasText(tree, '열정')).toBe(true);
    expect(hasText(tree, '인증됨')).toBe(true);
    expect(hasText(tree, 'VIP')).toBe(true);
  });
});
