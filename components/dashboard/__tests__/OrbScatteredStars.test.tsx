import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withRepeat: jest.fn((v: unknown) => v),
    withTiming: jest.fn((v: unknown) => v),
    Easing: {
      inOut: (f: unknown) => f,
      sin: (v: number) => v,
    },
  };
});

import { OrbScatteredStars } from '../OrbScatteredStars';

describe('OrbScatteredStars', () => {
  it('コンテナを描画する', () => {
    render(<OrbScatteredStars size={200} />);
    expect(screen.getByTestId('orb-scattered-stars')).toBeTruthy();
  });

  it('コンテナのサイズはsize * 2.0', () => {
    const size = 200;
    render(<OrbScatteredStars size={size} />);
    const container = screen.getByTestId('orb-scattered-stars');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(style.width).toBe(size * 2.0);
    expect(style.height).toBe(size * 2.0);
  });

  it('pointerEventsがnone', () => {
    render(<OrbScatteredStars size={200} />);
    const container = screen.getByTestId('orb-scattered-stars');
    expect(container.props.pointerEvents).toBe('none');
  });

  it('複数の星パーティクルを描画する', () => {
    render(<OrbScatteredStars size={200} />);
    const stars = screen.getAllByTestId('scattered-star');
    expect(stars.length).toBeGreaterThanOrEqual(8);
    expect(stars.length).toBeLessThanOrEqual(12);
  });
});
