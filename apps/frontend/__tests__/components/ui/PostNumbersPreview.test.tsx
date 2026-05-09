import React from 'react';
import { render } from '@testing-library/react-native';
import { PostNumbersPreview } from '../../../components/ui/PostNumbersPreview';

describe('PostNumbersPreview', () => {
  it('renders all ball numbers across multiple games', () => {
    const games = [
      { numbers: [1, 2, 3, 4, 5, 6] },
      { numbers: [7, 8, 9, 10, 11, 12] },
    ];
    const { getByText } = render(<PostNumbersPreview games={games} method="사주팔자" />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('사주팔자 방식으로 생성')).toBeTruthy();
  });
});
