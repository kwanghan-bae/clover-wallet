jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: 'blur-view' }),
  };
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard } from '../../../components/ui/GlassCard';

describe('GlassCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>카드 내용</Text>
      </GlassCard>
    );
    expect(getByText('카드 내용')).toBeTruthy();
  });

  it('renders with custom opacity and blur', () => {
    const { getByText } = render(
      <GlassCard opacity={0.3} blur={20}>
        <Text>투명 카드</Text>
      </GlassCard>
    );
    expect(getByText('투명 카드')).toBeTruthy();
  });

  it('renders with dark theme (isDark true)', () => {
    const { useTheme } = require('../../../hooks/useTheme');
    (useTheme as jest.Mock).mockReturnValueOnce({ isDark: true, themePreference: 'dark', setThemePreference: jest.fn() });
    const { getByText } = render(
      <GlassCard>
        <Text>다크 카드</Text>
      </GlassCard>
    );
    expect(getByText('다크 카드')).toBeTruthy();
  });

  it('renders with custom borderRadius', () => {
    const { getByText } = render(
      <GlassCard borderRadius={12}>
        <Text>둥근 카드</Text>
      </GlassCard>
    );
    expect(getByText('둥근 카드')).toBeTruthy();
  });
});
