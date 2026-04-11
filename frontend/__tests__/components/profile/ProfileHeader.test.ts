import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('ProfileHeader', () => {
  const defaultProps = {
    nickname: '테스트유저',
    email: 'test@example.com',
    followCounts: { followers: 10, following: 5 },
    isMe: false,
    isFollowPending: false,
    onFollowToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** 닉네임과 이메일을 표시합니다 */
  test('닉네임과 이메일을 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, defaultProps)
    );
    const tree = toJSON();
    expect(hasText(tree, '테스트유저')).toBe(true);
    expect(hasText(tree, 'test@example.com')).toBe(true);
  });

  /** 아바타 이니셜을 올바르게 표시합니다 */
  test('아바타 이니셜을 올바르게 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, defaultProps)
    );
    expect(hasText(toJSON(), '테')).toBe(true);
  });

  /** 팔로우 버튼이 다른 사용자일 때 표시됩니다 */
  test('다른 사용자일 때 팔로우 버튼을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, defaultProps)
    );
    expect(hasText(toJSON(), '팔로우')).toBe(true);
  });

  /** 내 프로필일 때 팔로우 버튼이 없습니다 */
  test('내 프로필일 때 팔로우 버튼을 숨긴다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, { ...defaultProps, isMe: true })
    );
    // 팔로우 텍스트가 없어야 함 (팔로워/팔로잉은 ProfileStats에 있으므로 존재)
    const tree = toJSON();
    const jsonStr = JSON.stringify(tree);
    // "팔로우"가 "팔로워"/"팔로잉" 컨텍스트 밖에서 나타나지 않아야 함
    expect(jsonStr.includes('>팔로우<')).toBe(false);
  });

  /** 팔로우 로딩 중에는 처리 중 텍스트를 표시합니다 */
  test('팔로우 로딩 중에는 처리 중 텍스트를 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, { ...defaultProps, isFollowPending: true })
    );
    expect(hasText(toJSON(), '처리 중...')).toBe(true);
  });

  /** 닉네임이 없으면 기본값을 표시합니다 */
  test('닉네임이 없으면 기본값을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(ProfileHeader, { ...defaultProps, nickname: null })
    );
    expect(hasText(toJSON(), '이름 없음')).toBe(true);
  });
});
