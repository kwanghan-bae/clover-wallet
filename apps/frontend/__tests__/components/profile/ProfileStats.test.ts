import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileStats } from '../../../components/profile/ProfileStats';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('ProfileStats', () => {
  /** 팔로워/팔로잉 카운트를 표시합니다 */
  test('팔로워/팔로잉 수를 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileStats, { followCounts: { followers: 42, following: 15 } })
    );
    const tree = toJSON();
    expect(hasText(tree, '42')).toBe(true);
    expect(hasText(tree, '15')).toBe(true);
    expect(hasText(tree, '팔로워')).toBe(true);
    expect(hasText(tree, '팔로잉')).toBe(true);
  });

  /** followCounts가 없으면 0을 표시합니다 */
  test('followCounts가 없으면 0을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileStats, { followCounts: null })
    );
    const tree = toJSON();
    expect(hasText(tree, '팔로워')).toBe(true);
    expect(hasText(tree, '팔로잉')).toBe(true);
    // "0" should appear in the output
    expect(hasText(tree, '"0"')).toBe(true);
  });
});
