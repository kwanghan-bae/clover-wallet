import React from 'react';
import { render } from '@testing-library/react-native';
import { BallRow } from '../../../components/ui/BallRow';
import { Input } from '../../../components/ui/Input';
import { EmptyIllustration } from '../../../components/ui/EmptyIllustration';

describe('BallRow', () => {
  it('renders all numbers', () => {
    const { getByText } = render(<BallRow numbers={[1, 15, 22, 33, 40, 45]} />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('45')).toBeTruthy();
  });

  it('renders empty row when no numbers', () => {
    const { toJSON } = render(<BallRow numbers={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { toJSON } = render(<BallRow numbers={[7, 14, 21]} className="mt-4" />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('Input', () => {
  it('renders without label or error', () => {
    const { toJSON } = render(<Input placeholder="입력하세요" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(<Input label="이름" />);
    expect(getByText('이름')).toBeTruthy();
  });

  it('renders error message', () => {
    const { getByText } = render(<Input error="필수 입력 항목입니다" />);
    expect(getByText('필수 입력 항목입니다')).toBeTruthy();
  });

  it('renders with both label and error', () => {
    const { getByText } = render(<Input label="이메일" error="유효하지 않은 이메일" />);
    expect(getByText('이메일')).toBeTruthy();
    expect(getByText('유효하지 않은 이메일')).toBeTruthy();
  });
});

describe('EmptyIllustration', () => {
  it('renders without props', () => {
    const { toJSON } = render(<EmptyIllustration />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { toJSON } = render(<EmptyIllustration color="#FF5722" />);
    expect(toJSON()).toBeTruthy();
  });
});
