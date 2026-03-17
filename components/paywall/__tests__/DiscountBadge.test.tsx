import React from 'react';
import { render } from '@testing-library/react-native';
import { DiscountBadge } from '../DiscountBadge';

describe('DiscountBadge', () => {
  it('割引率のテキストを表示する', () => {
    const { getByText } = render(<DiscountBadge percentage={69} />);
    expect(getByText('69%')).toBeTruthy();
    expect(getByText('OFF')).toBeTruthy();
  });

  it('カスタムの割引率を表示する', () => {
    const { getByText } = render(<DiscountBadge percentage={50} />);
    expect(getByText('50%')).toBeTruthy();
  });
});
