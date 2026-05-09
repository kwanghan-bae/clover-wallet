import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HistoryItem } from '../../../components/ui/HistoryItem';

const mockRecord = {
  id: 1,
  method: 'TICKET',
  round: 1055,
  games: [{ numbers: [3, 11, 22, 33, 40, 45] }],
  createdAt: '2024-03-15T09:00:00Z',
};

describe('HistoryItem', () => {
  it('renders the round number', () => {
    const { getByText } = render(
      <HistoryItem record={mockRecord} onDelete={jest.fn()} />
    );
    expect(getByText('1055회차')).toBeTruthy();
  });

  it('renders all lotto ball numbers', () => {
    const { getByText } = render(
      <HistoryItem record={mockRecord} onDelete={jest.fn()} />
    );
    expect(getByText('3')).toBeTruthy();
    expect(getByText('11')).toBeTruthy();
    expect(getByText('22')).toBeTruthy();
    expect(getByText('33')).toBeTruthy();
    expect(getByText('40')).toBeTruthy();
    expect(getByText('45')).toBeTruthy();
  });

  it('renders formatted date', () => {
    const { getByText } = render(
      <HistoryItem record={mockRecord} onDelete={jest.fn()} />
    );
    expect(getByText('2024.03.15')).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getByLabelText } = render(
      <HistoryItem record={mockRecord} onDelete={onDelete} />
    );
    fireEvent.press(getByLabelText('내역 삭제'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders with a different date', () => {
    const recordWithDate = { ...mockRecord, createdAt: '2024-05-01T00:00:00Z' };
    const { getByText } = render(
      <HistoryItem record={recordWithDate} onDelete={jest.fn()} />
    );
    expect(getByText(/2024/)).toBeTruthy();
  });

  test('5게임 묶음 → "5게임 묶음" 배지 + 라벨 A~E', () => {
    const record = {
      id: 2,
      method: 'SAJU',
      createdAt: '2026-05-09T00:00:00.000Z',
      games: [
        { numbers: [1, 2, 3, 4, 5, 6] },
        { numbers: [7, 8, 9, 10, 11, 12] },
        { numbers: [13, 14, 15, 16, 17, 18] },
        { numbers: [19, 20, 21, 22, 23, 24] },
        { numbers: [25, 26, 27, 28, 29, 30] },
      ],
    };
    const { getByText } = render(
      <HistoryItem record={record} onDelete={jest.fn()} />,
    );
    expect(getByText('5게임 묶음')).toBeTruthy();
    ['A', 'B', 'C', 'D', 'E'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  test('1게임 (games.length===1) → 묶음 배지 없음, 라벨 없음', () => {
    const record = {
      id: 3,
      method: 'SAJU',
      createdAt: '2026-05-09T00:00:00.000Z',
      games: [{ numbers: [1, 2, 3, 4, 5, 6] }],
    };
    const { queryByText } = render(
      <HistoryItem record={record} onDelete={jest.fn()} />,
    );
    expect(queryByText(/게임 묶음/)).toBeNull();
    expect(queryByText('A')).toBeNull();
  });
});
