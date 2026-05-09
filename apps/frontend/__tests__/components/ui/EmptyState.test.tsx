import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    const { getByText } = render(
      <EmptyState
        icon={<Text>🎫</Text>}
        title="아직 구매한 로또가 없어요"
        description="번호를 생성하거나 영수증을 스캔해보세요"
      />
    );
    expect(getByText('아직 구매한 로또가 없어요')).toBeTruthy();
    expect(getByText('번호를 생성하거나 영수증을 스캔해보세요')).toBeTruthy();
    expect(getByText('🎫')).toBeTruthy();
  });

  it('renders CTA button when provided and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon={<Text>🎫</Text>}
        title="비어있음"
        cta={{ label: '번호 생성하기', onPress }}
      />
    );
    fireEvent.press(getByText('번호 생성하기'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits CTA when not provided', () => {
    const { queryByText } = render(
      <EmptyState icon={<Text>x</Text>} title="비어있음" />
    );
    expect(queryByText('번호 생성하기')).toBeNull();
  });
});
