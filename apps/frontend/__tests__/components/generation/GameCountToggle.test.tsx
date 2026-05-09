import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCountToggle } from '../../../components/generation/GameCountToggle';

describe('GameCountToggle', () => {
  test('3개 옵션 모두 렌더', () => {
    const { getByText } = render(
      <GameCountToggle value={1} onChange={jest.fn()} />,
    );
    expect(getByText('1게임')).toBeTruthy();
    expect(getByText(/5게임/)).toBeTruthy();
    expect(getByText(/10게임/)).toBeTruthy();
  });

  test('value=5 → 5게임 버튼이 selected accessibilityState', () => {
    const { getByLabelText } = render(
      <GameCountToggle value={5} onChange={jest.fn()} />,
    );
    const btn = getByLabelText('5게임');
    expect(btn.props.accessibilityState).toMatchObject({ selected: true });
  });

  test('1게임 버튼 클릭 시 onChange(1) 호출', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <GameCountToggle value={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('1게임'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('10게임 버튼 클릭 시 onChange(10) 호출', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <GameCountToggle value={1} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('10게임'));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
