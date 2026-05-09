import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppBar } from '../../../components/ui/AppBar';

describe('AppBar', () => {
  it('home variant renders Clover Wallet brand', () => {
    const { getByText } = render(<AppBar variant="home" hasUnread={false} onBellPress={jest.fn()} />);
    expect(getByText('Clover Wallet')).toBeTruthy();
  });

  it('home variant fires onBellPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<AppBar variant="home" hasUnread onBellPress={onPress} />);
    fireEvent.press(getByLabelText('알림'));
    expect(onPress).toHaveBeenCalled();
  });

  it('screen variant renders title and back button', () => {
    const onBack = jest.fn();
    const { getByText, getByLabelText } = render(
      <AppBar variant="screen" title="번호 생성" onBackPress={onBack} />
    );
    expect(getByText('번호 생성')).toBeTruthy();
    fireEvent.press(getByLabelText('뒤로 가기'));
    expect(onBack).toHaveBeenCalled();
  });

  it('modal variant renders title and close button', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <AppBar variant="modal" title="글 작성" onClosePress={onClose} />
    );
    expect(getByText('글 작성')).toBeTruthy();
    fireEvent.press(getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalled();
  });
});
