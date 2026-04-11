import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FeedTabSelector } from '../../../components/community/FeedTabSelector';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('FeedTabSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  /** 전체/팔로잉 두 탭을 렌더링합니다 */
  test('전체와 팔로잉 탭을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(FeedTabSelector, { feedType: 'all', onSelect: mockOnSelect })
    );
    const tree = toJSON();
    expect(hasText(tree, '전체')).toBe(true);
    expect(hasText(tree, '팔로잉')).toBe(true);
  });

  /** 팔로잉 탭을 누르면 onSelect가 호출됩니다 */
  test('팔로잉 탭을 누르면 onSelect("following")가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(FeedTabSelector, { feedType: 'all', onSelect: mockOnSelect })
    );
    fireEvent.press(getByLabelText('팔로잉'));
    expect(mockOnSelect).toHaveBeenCalledWith('following');
  });

  /** 전체 탭을 누르면 onSelect가 호출됩니다 */
  test('전체 탭을 누르면 onSelect("all")가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(FeedTabSelector, { feedType: 'following', onSelect: mockOnSelect })
    );
    fireEvent.press(getByLabelText('전체'));
    expect(mockOnSelect).toHaveBeenCalledWith('all');
  });

  /** 접근성 역할이 올바르게 설정됩니다 */
  test('탭에 올바른 접근성 레이블이 있다', () => {
    const { getByLabelText } = render(
      React.createElement(FeedTabSelector, { feedType: 'all', onSelect: mockOnSelect })
    );
    expect(getByLabelText('전체')).toBeTruthy();
    expect(getByLabelText('팔로잉')).toBeTruthy();
  });
});
