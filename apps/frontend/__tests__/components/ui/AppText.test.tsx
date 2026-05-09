import React from 'react';
import { render } from '@testing-library/react-native';
import { AppText } from '../../../components/ui/AppText';

describe('AppText', () => {
  it('renders body variant by default', () => {
    const { getByText } = render(<AppText>안녕</AppText>);
    const node = getByText('안녕');
    expect(node.props.style).toEqual(
      expect.objectContaining({ fontFamily: 'NotoSansKR_500Medium' })
    );
  });

  it('renders display variant with extrabold weight and -1.2 tracking', () => {
    const { getByText } = render(<AppText variant="display">42</AppText>);
    const node = getByText('42');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'NotoSansKR_800ExtraBold',
        fontSize: 30,
        letterSpacing: -1.2,
      })
    );
  });

  it('passes through custom className', () => {
    const { getByText } = render(<AppText variant="title" className="text-primary">제목</AppText>);
    expect(getByText('제목').props.className).toContain('text-primary');
  });
});
