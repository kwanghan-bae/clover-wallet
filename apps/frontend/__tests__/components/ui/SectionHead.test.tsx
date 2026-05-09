import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionHead } from '../../../components/ui/SectionHead';

describe('SectionHead', () => {
  it('renders the title', () => {
    const { getByText } = render(<SectionHead title="빠른 실행" />);
    expect(getByText('빠른 실행')).toBeTruthy();
  });

  it('renders link when provided and fires onLinkPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SectionHead title="최근 구매" linkText="전체 보기" onLinkPress={onPress} />
    );
    fireEvent.press(getByText('전체 보기 ›'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits link area when linkText is missing', () => {
    const { queryByText } = render(<SectionHead title="제목" />);
    expect(queryByText('전체 보기 ›')).toBeNull();
  });
});
