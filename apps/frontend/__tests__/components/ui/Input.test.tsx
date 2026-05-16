import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../../../components/ui/Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Input label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders clear button when value is present and text is typed', () => {
    const onChangeTextMock = jest.fn();
    const { getByLabelText } = render(
      <Input value="some text" onChangeText={onChangeTextMock} />
    );

    const clearBtn = getByLabelText('입력 내용 지우기');
    expect(clearBtn).toBeTruthy();

    fireEvent.press(clearBtn);
    expect(onChangeTextMock).toHaveBeenCalledWith('');
  });

  it('does not render clear button when value is empty', () => {
    const { queryByLabelText } = render(<Input value="" />);
    expect(queryByLabelText('입력 내용 지우기')).toBeNull();
  });
});
