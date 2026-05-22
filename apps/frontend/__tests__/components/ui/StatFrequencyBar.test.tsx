import React from 'react';
import { render } from '@testing-library/react-native';
import { StatFrequencyBar } from '../../../components/ui/StatFrequencyBar';

describe('StatFrequencyBar', () => {
  it('renders correctly with number and frequency in light mode', () => {
    const { getByText } = render(
      <StatFrequencyBar num="7" count={5} maxCount={10} isDark={false} />
    );
    expect(getByText('7')).toBeTruthy();
    expect(getByText('5회')).toBeTruthy();
  });

  it('renders correctly with number and frequency in dark mode', () => {
    const { getByText } = render(
      <StatFrequencyBar num="12" count={8} maxCount={10} isDark={true} />
    );
    expect(getByText('12')).toBeTruthy();
    expect(getByText('8회')).toBeTruthy();
  });
});
