import React from 'react';
import { render } from '@testing-library/react-native';
import { WinningHistoryItem } from '../../../components/ui/WinningHistoryItem';

describe('WinningHistoryItem', () => {
  const baseItem = {
    round: 1050,
    rank: 1,
    storeName: '행운 복권방',
    address: '서울 강남구',
    method: '자동',
  };

  it('renders round number for 1st place', () => {
    const { getByText } = render(<WinningHistoryItem item={baseItem} />);
    expect(getByText('1050회 당첨')).toBeTruthy();
  });

  it('renders rank for 1st place', () => {
    const { getByText } = render(<WinningHistoryItem item={baseItem} />);
    expect(getByText('1등')).toBeTruthy();
  });

  it('renders method text', () => {
    const { getByText } = render(<WinningHistoryItem item={baseItem} />);
    expect(getByText('자동')).toBeTruthy();
  });

  it('renders 2nd place item', () => {
    const secondItem = { ...baseItem, rank: 2 };
    const { getByText } = render(<WinningHistoryItem item={secondItem} />);
    expect(getByText('2등')).toBeTruthy();
  });

  it('renders default method when method is undefined', () => {
    const itemNoMethod = { ...baseItem, method: undefined };
    const { getByText } = render(<WinningHistoryItem item={itemNoMethod} />);
    expect(getByText('자동')).toBeTruthy();
  });
});
