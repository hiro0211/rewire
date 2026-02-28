import React from 'react';
import { render } from '@testing-library/react-native';
import { GlowDivider } from '../GlowDivider';

describe('GlowDivider', () => {
  it('testID="glow-divider" が存在する', () => {
    const { getByTestId } = render(<GlowDivider />);
    expect(getByTestId('glow-divider')).toBeTruthy();
  });

  it('クラッシュしない', () => {
    expect(() => render(<GlowDivider />)).not.toThrow();
  });

  it('カスタムカラーでもクラッシュしない', () => {
    expect(() => render(<GlowDivider color="rgba(255,0,0,0.5)" />)).not.toThrow();
  });
});
