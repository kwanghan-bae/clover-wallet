import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostCard } from '../../../components/ui/PostCard';

const mockPost = {
  id: 1,
  title: '오늘 1등 당첨 후기',
  content: '드디어 1등에 당첨되었습니다! 정말 믿기 어렵네요.',
  likes: 42,
  isLiked: false,
  createdAt: '2024-03-15T10:30:00Z',
  userSummary: { id: 10, nickname: '행운왕', badges: [] },
  _count: { comments: 5 },
};

describe('PostCard', () => {
  it('renders post title', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('오늘 1등 당첨 후기')).toBeTruthy();
  });

  it('renders post content', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('드디어 1등에 당첨되었습니다! 정말 믿기 어렵네요.')).toBeTruthy();
  });

  it('renders author nickname', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('행운왕')).toBeTruthy();
  });

  it('renders like count', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('42')).toBeTruthy();
  });

  it('renders comment count', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onLike when like button pressed', () => {
    const onLike = jest.fn();
    const { getByText } = render(<PostCard post={mockPost} onLike={onLike} />);
    fireEvent.press(getByText('42'));
    expect(onLike).toHaveBeenCalledWith(1);
  });

  it('calls onPress when card pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PostCard post={mockPost} onPress={onPress} />);
    fireEvent.press(getByText('오늘 1등 당첨 후기'));
    expect(onPress).toHaveBeenCalledWith(1);
  });

  it('renders 익명 when nickname is empty', () => {
    const anonymousPost = { ...mockPost, userSummary: { id: 99, nickname: '', badges: [] } };
    const { getByText } = render(<PostCard post={anonymousPost} />);
    expect(getByText('익명')).toBeTruthy();
  });

  it('does not render title section when title is empty', () => {
    const noTitlePost = { ...mockPost, title: '' };
    const { queryByText } = render(<PostCard post={noTitlePost} />);
    expect(queryByText('오늘 1등 당첨 후기')).toBeNull();
  });

  it('renders comment count as 0 when _count is undefined', () => {
    const noCountPost = { ...mockPost, _count: undefined };
    const { getByText } = render(<PostCard post={noCountPost} />);
    expect(getByText('0')).toBeTruthy();
  });
});
