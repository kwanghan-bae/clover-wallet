import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/index';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Dices: 'Dices',
  QrCode: 'QrCode',
  BarChart3: 'BarChart3',
  MapPin: 'MapPin',
  Navigation: 'Navigation',
  Bell: 'Bell',
  ChevronRight: 'ChevronRight',
  Filter: 'Filter',
}));

describe('HomeScreen', () => {
  test('renders welcome text and app title', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Clover Wallet')).toBeTruthy();
  });

  test('renders quick action buttons with correct Korean labels', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('번호 추첨')).toBeTruthy();
    expect(getByText('QR 스캔')).toBeTruthy();
    expect(getByText('번호 분석')).toBeTruthy();
    expect(getByText('여행 플랜')).toBeTruthy();
    expect(getByText('로또 명당')).toBeTruthy();
  });

  test('renders recent history section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('최근 당첨 결과')).toBeTruthy();
    expect(getByText('아직 구매한 로또가 없습니다.')).toBeTruthy();
  });

  test('renders next draw info card', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('당첨 발표까지')).toBeTruthy();
    expect(getByText(/회/)).toBeTruthy(); // 제 XXX 회
  });
});
