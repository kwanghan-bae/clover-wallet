import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MenuSection } from '../../../components/mypage/MenuSection';

function hasText(json: any, text: string): boolean {
  return JSON.stringify(json).includes(text);
}

describe('MenuSection', () => {
  const defaultProps = {
    unreadCount: 0,
    onNavigateNotifications: jest.fn(),
    onLogout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** 모든 메뉴 항목이 올바르게 렌더링됩니다 */
  test('모든 메뉴 항목을 렌더링한다', () => {
    const { toJSON } = render(
      React.createElement(MenuSection, defaultProps)
    );
    const tree = toJSON();
    expect(hasText(tree, '알림')).toBe(true);
    expect(hasText(tree, '계정 설정')).toBe(true);
    expect(hasText(tree, '개인정보 처리방침')).toBe(true);
    expect(hasText(tree, '앱 정보')).toBe(true);
    expect(hasText(tree, '로그아웃')).toBe(true);
    expect(hasText(tree, '회원 탈퇴')).toBe(true);
  });

  /** 알림 메뉴를 누르면 네비게이션 콜백이 호출됩니다 */
  test('알림을 누르면 onNavigateNotifications가 호출된다', () => {
    const { getByLabelText } = render(
      React.createElement(MenuSection, defaultProps)
    );
    fireEvent.press(getByLabelText('알림'));
    expect(defaultProps.onNavigateNotifications).toHaveBeenCalled();
  });

  /** 개인정보 처리방침을 누르면 Alert가 표시됩니다 */
  test('개인정보 처리방침을 누르면 Alert가 표시된다', () => {
    const { Alert } = require('react-native');
    const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByLabelText } = render(
      React.createElement(MenuSection, defaultProps)
    );
    fireEvent.press(getByLabelText('개인정보 처리방침'));
    expect(mockAlert).toHaveBeenCalledWith('개인정보 처리방침', '준비 중입니다.');
    mockAlert.mockRestore();
  });
});
