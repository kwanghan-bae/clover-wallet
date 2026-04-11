import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HistoryItem } from '../../../components/ui/HistoryItem';

const mockRecord = {
  id: 1,
  status: 'CHECKED' as const,
  round: 1055,
  numbers: [3, 11, 22, 33, 40, 45],
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
});
