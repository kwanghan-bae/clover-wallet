import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

describe('PrimaryButton', () => {
  test('renders correctly with label', () => {
    const { getByText } = render(<PrimaryButton label="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<PrimaryButton label="Click Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('shows activity indicator when isLoading is true', () => {
    const { queryByText } = render(
      <PrimaryButton label="Loading" onPress={() => {}} isLoading={true} />
    );
    
    // Label should not be visible or be replaced by loader
    expect(queryByText('Loading')).toBeFalsy();
  });

  test('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton label="Disabled" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
