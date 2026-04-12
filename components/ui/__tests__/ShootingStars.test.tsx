import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>{children}</View>
    ),
  };
});

import { ShootingStars } from '../ShootingStars';

describe('ShootingStars', () => {
  it('デフォルトで3本の流れ星がレンダリングされる', () => {
    const { getAllByTestId } = render(<ShootingStars />);
    const stars = getAllByTestId(/^shooting-star-\d+$/);
    expect(stars).toHaveLength(3);
  });

  it('count propで流れ星の数を制御できる', () => {
    const { getAllByTestId } = render(<ShootingStars count={5} />);
    const stars = getAllByTestId(/^shooting-star-\d+$/);
    expect(stars).toHaveLength(5);
  });

  it('count=1で1本だけレンダリングされる', () => {
    const { getAllByTestId } = render(<ShootingStars count={1} />);
    const stars = getAllByTestId(/^shooting-star-\d+$/);
    expect(stars).toHaveLength(1);
  });

  it('マウント・アンマウントでクラッシュしない', () => {
    const { unmount } = render(<ShootingStars />);
    expect(() => unmount()).not.toThrow();
  });
});
