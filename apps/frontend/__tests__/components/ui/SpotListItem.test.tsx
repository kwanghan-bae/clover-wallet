import React from 'react';
import { render } from '@testing-library/react-native';
import { SpotListItem } from '../../../components/ui/SpotListItem';
import { LottoSpot } from '../../../api/types/spots';

const mockSpot: LottoSpot = {
  id: 1,
  name: '행운 복권방',
  address: '서울 강남구 테헤란로 123',
  latitude: 37.5665,
  longitude: 126.978,
  firstPlaceWins: 5,
  secondPlaceWins: 12,
};

describe('SpotListItem', () => {
  it('renders spot name', () => {
    const { getByText } = render(<SpotListItem spot={mockSpot} />);
    expect(getByText('행운 복권방')).toBeTruthy();
  });

  it('renders spot address', () => {
    const { getByText } = render(<SpotListItem spot={mockSpot} />);
    expect(getByText('서울 강남구 테헤란로 123')).toBeTruthy();
  });

  it('renders first place win count', () => {
    const { getByText } = render(<SpotListItem spot={mockSpot} />);
    expect(getByText('1등 5회')).toBeTruthy();
  });

  it('renders second place win count', () => {
    const { getByText } = render(<SpotListItem spot={mockSpot} />);
    expect(getByText('2등 12회')).toBeTruthy();
  });

  it('renders spot with zero wins', () => {
    const zeroWinSpot = { ...mockSpot, firstPlaceWins: 0, secondPlaceWins: 0 };
    const { getByText } = render(<SpotListItem spot={zeroWinSpot} />);
    expect(getByText('1등 0회')).toBeTruthy();
    expect(getByText('2등 0회')).toBeTruthy();
  });
});
