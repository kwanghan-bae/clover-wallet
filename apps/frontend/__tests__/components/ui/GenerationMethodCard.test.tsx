import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GenerationMethodCard } from '../../../components/ui/GenerationMethodCard';

const mockMethod = {
  id: 'random',
  title: '완전 랜덤',
  subtitle: '무작위 번호 생성',
  color: '#4CAF50',
  icon: React.createElement('View', { testID: 'method-icon' }),
};

describe('GenerationMethodCard', () => {
  it('renders method title', () => {
    const { getByText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={false} onPress={jest.fn()} />
    );
    expect(getByText('완전 랜덤')).toBeTruthy();
  });

  it('renders method subtitle', () => {
    const { getByText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={false} onPress={jest.fn()} />
    );
    expect(getByText('무작위 번호 생성')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={false} onPress={onPress} />
    );
    fireEvent.press(getByLabelText('완전 랜덤: 무작위 번호 생성'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows selected state via accessibilityState', () => {
    const { getByLabelText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={true} onPress={jest.fn()} />
    );
    const button = getByLabelText('완전 랜덤: 무작위 번호 생성');
    expect(button.props.accessibilityState?.selected).toBe(true);
  });

  it('shows unselected state via accessibilityState', () => {
    const { getByLabelText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={false} onPress={jest.fn()} />
    );
    const button = getByLabelText('완전 랜덤: 무작위 번호 생성');
    expect(button.props.accessibilityState?.selected).toBe(false);
  });

  it('has correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <GenerationMethodCard method={mockMethod} isSelected={false} onPress={jest.fn()} />
    );
    const button = getByLabelText('완전 랜덤: 무작위 번호 생성');
    expect(button.props.accessibilityLabel).toBe('완전 랜덤: 무작위 번호 생성');
  });
});
