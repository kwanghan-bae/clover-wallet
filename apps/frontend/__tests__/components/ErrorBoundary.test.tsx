import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlobalErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error on demand
function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error message');
  return React.createElement('View', { testID: 'ok-view' });
}

// Suppress expected error output during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('GlobalErrorBoundary', () => {
  it('renders children when no error', () => {
    const { getByTestId } = render(
      <GlobalErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </GlobalErrorBoundary>
    );
    expect(getByTestId('ok-view')).toBeTruthy();
  });

  it('renders error UI when child throws', () => {
    const { getByText } = render(
      <GlobalErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(getByText('문제가 발생했습니다')).toBeTruthy();
  });

  it('shows error message in error UI', () => {
    const { getByText } = render(
      <GlobalErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(getByText(/Test error message/)).toBeTruthy();
  });

  it('shows retry button in error state', () => {
    const { getByLabelText } = render(
      <GlobalErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(getByLabelText('다시 시도하기')).toBeTruthy();
  });

  it('shows retry button that can be pressed', () => {
    const { getByLabelText } = render(
      <GlobalErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    // Pressing retry should not throw
    expect(() => fireEvent.press(getByLabelText('다시 시도하기'))).not.toThrow();
  });
});
