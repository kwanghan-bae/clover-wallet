import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';

const wrap = (ui: React.ReactNode) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 320, height: 640 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
    {ui}
  </SafeAreaProvider>
);

describe('ScreenContainer', () => {
  it('renders children', () => {
    const { getByText } = render(wrap(<ScreenContainer><Text>본문</Text></ScreenContainer>));
    expect(getByText('본문')).toBeTruthy();
  });

  it('applies surface-muted background by default', () => {
    const { UNSAFE_getByType } = render(wrap(<ScreenContainer><Text>x</Text></ScreenContainer>));
    const View = require('react-native-safe-area-context').SafeAreaView;
    expect(UNSAFE_getByType(View).props.className).toContain('bg-surface-muted');
  });
});
