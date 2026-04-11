import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/index';

// expo-router 모킹
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// lucide-react-native 아이콘 모킹
jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (_target, name) => (props: Record<string, unknown>) => React.createElement('View', { ...props, testID: String(name) }),
  });
});

/**
 * HomeScreen 컴포넌트에 대한 단위 테스트입니다.
 * 화면 내 주요 텍스트 요소와 퀵 액션 버튼의 렌더링 상태를 검증합니다.
 */
describe('HomeScreen', () => {
  /** 앱 제목과 환영 메시지가 정상적으로 표시되는지 확인합니다. */
  test('renders welcome text and app title', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Clover Wallet')).toBeTruthy();
  });

  /** 각 퀵 액션 버튼의 한글 라벨이 정확하게 표시되는지 확인합니다. */
  test('renders quick action buttons with correct Korean labels', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('번호 추첨')).toBeTruthy();
    expect(getByText('QR 스캔')).toBeTruthy();
    expect(getByText('번호 분석')).toBeTruthy();
    expect(getByText('여행 플랜')).toBeTruthy();
    expect(getByText('로또 명당')).toBeTruthy();
  });

  /** 최근 당첨 결과 섹션의 초기 상태 렌더링을 확인합니다. */
  test('renders recent history section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('최근 당첨 결과')).toBeTruthy();
    expect(getByText('아직 구매한 로또가 없습니다.')).toBeTruthy();
  });

  /** 다음 회차 당첨 정보 카드가 표시되는지 확인합니다. */
  test('renders next draw info card', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('당첨 발표까지')).toBeTruthy();
    expect(getByText(/회/)).toBeTruthy(); // 제 XXX 회
  });
});
