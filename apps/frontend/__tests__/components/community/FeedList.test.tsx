import React from 'react';
import { render } from '@testing-library/react-native';
import { FeedList } from '../../../components/community/FeedList';

const mockPost = {
  id: 1,
  title: '테스트 게시글',
  content: '게시글 내용입니다.',
  likes: 5,
  isLiked: false,
  createdAt: '2024-01-15T10:00:00Z',
  userSummary: { id: 1, nickname: '테스터', badges: [] },
  _count: { comments: 2 },
};

describe('FeedList', () => {
  const defaultProps = {
    posts: [mockPost],
    isLoading: false,
    onRefresh: jest.fn(),
    onLike: jest.fn(),
    onShare: jest.fn(),
    onCreatePost: jest.fn(),
  };

  it('renders posts when list is non-empty', () => {
    const { getByText } = render(<FeedList {...defaultProps} />);
    expect(getByText('테스트 게시글')).toBeTruthy();
  });

  it('renders without crashing with empty post list', () => {
    const { toJSON } = render(
      <FeedList {...defaultProps} posts={[]} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders in loading state', () => {
    const { toJSON } = render(
      <FeedList {...defaultProps} isLoading={true} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders multiple posts', () => {
    const secondPost = { ...mockPost, id: 2, title: '두 번째 게시글' };
    const { getByText } = render(
      <FeedList {...defaultProps} posts={[mockPost, secondPost]} />
    );
    expect(getByText('테스트 게시글')).toBeTruthy();
    expect(getByText('두 번째 게시글')).toBeTruthy();
  });
});
