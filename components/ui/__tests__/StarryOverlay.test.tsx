import React from 'react';
import { render } from '@testing-library/react-native';

import { StarryOverlay } from '../StarryOverlay';

describe('StarryOverlay', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<StarryOverlay />)).not.toThrow();
  });

  it('40個の星が表示される', () => {
    const { getAllByTestId } = render(<StarryOverlay />);
    const stars = getAllByTestId(/^star-dot-/);
    expect(stars).toHaveLength(40);
  });

  it('背景色を持たない（LinearGradientが存在しない）', () => {
    const { queryByTestId } = render(<StarryOverlay />);
    expect(queryByTestId('starry-gradient')).toBeNull();
  });

  it('pointerEvents が none に設定されている', () => {
    const { getByTestId } = render(<StarryOverlay />);
    const overlay = getByTestId('starry-overlay');
    expect(overlay.props.pointerEvents).toBe('none');
  });
});
