import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

/**
 * PrimaryButton 공통 컴포넌트에 대한 단위 테스트입니다.
 * 버튼 라벨 렌더링, 클릭 이벤트 처리, 로딩 상태 및 비활성화 로직을 검증합니다.
 */
describe('PrimaryButton', () => {
  /** 버튼 라벨이 화면에 올바르게 표시되는지 확인합니다. */
  test('renders correctly with label', () => {
    const { getByText } = render(<PrimaryButton label="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  /** 사용자가 버튼을 클릭했을 때 onPress 콜백이 실행되는지 확인합니다. */
  test('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<PrimaryButton label="Click Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  /** 로딩 중(isLoading=true)일 때 버튼 라벨이 보이지 않는지 확인합니다. */
  test('shows activity indicator when isLoading is true', () => {
    const { queryByText } = render(
      <PrimaryButton label="Loading" onPress={() => {}} isLoading={true} />
    );
    
    // 로딩 중에는 텍스트 라벨이 표시되지 않아야 합니다.
    expect(queryByText('Loading')).toBeFalsy();
  });

  /** 비활성화(disabled=true) 상태에서 클릭 이벤트가 무시되는지 확인합니다. */
  test('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton label="Disabled" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
