import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommentItem } from '../../../components/ui/CommentItem';

const mockComment = {
  id: 1,
  content: '이 복권방 진짜 대박입니다!',
  likes: 3,
  createdAt: '2024-01-15T10:00:00Z',
  user: { id: 42, ssoQualifier: 'user42@gmail.com' },
  replies: [],
};

describe('CommentItem', () => {
  it('renders comment content', () => {
    const { getByText } = render(
      <CommentItem comment={mockComment} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(getByText('이 복권방 진짜 대박입니다!')).toBeTruthy();
  });

  it('extracts nickname from ssoQualifier', () => {
    const { getByText } = render(
      <CommentItem comment={mockComment} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(getByText('user42')).toBeTruthy();
  });

  it('shows 익명 when user is undefined', () => {
    const anonymousComment = { ...mockComment, user: undefined };
    const { getByText } = render(
      <CommentItem comment={anonymousComment} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(getByText('익명')).toBeTruthy();
  });

  it('shows reply button for top-level comments', () => {
    const { getByLabelText } = render(
      <CommentItem comment={mockComment} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(getByLabelText('답글 달기')).toBeTruthy();
  });

  it('does not show reply button for replies', () => {
    const { queryByLabelText } = render(
      <CommentItem comment={mockComment} isReply={true} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(queryByLabelText('답글 달기')).toBeNull();
  });

  it('calls onReply with comment id when reply pressed', () => {
    const onReply = jest.fn();
    const { getByLabelText } = render(
      <CommentItem comment={mockComment} onReply={onReply} onUserPress={jest.fn()} />
    );
    fireEvent.press(getByLabelText('답글 달기'));
    expect(onReply).toHaveBeenCalledWith(1);
  });

  it('calls onUserPress when user avatar pressed', () => {
    const onUserPress = jest.fn();
    const { getAllByLabelText } = render(
      <CommentItem comment={mockComment} onReply={jest.fn()} onUserPress={onUserPress} />
    );
    fireEvent.press(getAllByLabelText('user42 프로필 보기')[0]);
    expect(onUserPress).toHaveBeenCalledWith(42);
  });

  it('renders nested replies', () => {
    const commentWithReply = {
      ...mockComment,
      replies: [
        { id: 2, content: '저도요!', likes: 1, createdAt: '2024-01-15T11:00:00Z', user: { id: 43, ssoQualifier: 'user43@gmail.com' }, replies: [] },
      ],
    };
    const { getByText } = render(
      <CommentItem comment={commentWithReply} onReply={jest.fn()} onUserPress={jest.fn()} />
    );
    expect(getByText('저도요!')).toBeTruthy();
  });
});
