import React from 'react';
import { render } from '@testing-library/react-native';
import { LottoBall } from '../../../components/ui/LottoBall';

describe('LottoBall', () => {
  it('renders the number', () => {
    const { getByText } = render(<LottoBall number={7} />);
    expect(getByText('7')).toBeTruthy();
  });

  it('renders number 1 (orange range)', () => {
    const { getByText } = render(<LottoBall number={1} />);
    expect(getByText('1')).toBeTruthy();
  });

  it('renders number 15 (blue range)', () => {
    const { getByText } = render(<LottoBall number={15} />);
    expect(getByText('15')).toBeTruthy();
  });

  it('renders number 25 (red range)', () => {
    const { getByText } = render(<LottoBall number={25} />);
    expect(getByText('25')).toBeTruthy();
  });

  it('renders number 35 (grey range)', () => {
    const { getByText } = render(<LottoBall number={35} />);
    expect(getByText('35')).toBeTruthy();
  });

  it('renders number 45 (green range)', () => {
    const { getByText } = render(<LottoBall number={45} />);
    expect(getByText('45')).toBeTruthy();
  });

  it('renders with sm size', () => {
    const { getByText } = render(<LottoBall number={3} size="sm" />);
    expect(getByText('3')).toBeTruthy();
  });

  it('renders with lg size', () => {
    const { getByText } = render(<LottoBall number={10} size="lg" />);
    expect(getByText('10')).toBeTruthy();
  });

  it('renders with delay prop', () => {
    const { getByText } = render(<LottoBall number={22} delay={200} />);
    expect(getByText('22')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(<LottoBall number={33} className="extra-class" />);
    expect(getByText('33')).toBeTruthy();
  });
});
