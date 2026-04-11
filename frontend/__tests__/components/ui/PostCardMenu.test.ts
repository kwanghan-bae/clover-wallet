import React from 'react';
import { render } from '@testing-library/react-native';
import { PostCardMenu } from '../../../components/ui/PostCardMenu';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('PostCardMenu', () => {
  /** 소유자일 때 삭제 아이콘(Trash2)을 표시합니다 */
  test('소유자일 때 삭제 아이콘을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(PostCardMenu, { postId: 1, isOwner: true })
    );
    expect(hasText(toJSON(), 'Trash2')).toBe(true);
    expect(hasText(toJSON(), 'MoreHorizontal')).toBe(false);
  });

  /** 소유자가 아닐 때 더보기 아이콘(MoreHorizontal)을 표시합니다 */
  test('소유자가 아닐 때 더보기 아이콘을 표시한다', () => {
    const { toJSON } = render(
      React.createElement(PostCardMenu, { postId: 1, isOwner: false })
    );
    expect(hasText(toJSON(), 'MoreHorizontal')).toBe(true);
    expect(hasText(toJSON(), 'Trash2')).toBe(false);
  });

  /** 소유자 여부에 따라 다른 버튼이 표시됩니다 */
  test('소유자 상태에 따라 올바른 아이콘을 렌더링한다', () => {
    const ownerResult = render(
      React.createElement(PostCardMenu, { postId: 42, isOwner: true })
    );
    const nonOwnerResult = render(
      React.createElement(PostCardMenu, { postId: 42, isOwner: false })
    );
    expect(hasText(ownerResult.toJSON(), 'Trash2')).toBe(true);
    expect(hasText(nonOwnerResult.toJSON(), 'MoreHorizontal')).toBe(true);
  });
});
