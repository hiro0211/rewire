import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    withRepeat: (v: any) => v,
    withDelay: (_d: any, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: {
      out: (f: any) => f,
      inOut: (f: any) => f,
      cubic: (v: number) => v,
      sin: (v: number) => v,
      quad: (v: number) => v,
    },
    useFrameCallback: () => {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#FFFFFF', textSecondary: '#888888' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

import { StaticOrb } from '../StaticOrb';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const testColors: BadgeColorTriad = {
  core: '#FF0000',
  glow: '#FFAA00',
  accent: '#FF6600',
};

describe('StaticOrb', () => {
  it('size で指定したサイズの円を描画する', () => {
    const { getByTestId } = render(<StaticOrb colors={testColors} size={150} />);
    const orb = getByTestId('static-orb');
    const flatStyle = Array.isArray(orb.props.style)
      ? Object.assign({}, ...orb.props.style.filter(Boolean))
      : orb.props.style;
    expect(flatStyle.width).toBe(150);
    expect(flatStyle.height).toBe(150);
    expect(flatStyle.borderRadius).toBe(75);
  });

  it('Skia 利用可能な環境では Canvas を描画する（isDark=true のモック環境）', () => {
    const { getByTestId, queryByTestId } = render(
      <StaticOrb colors={testColors} size={100} />
    );
    expect(getByTestId('static-orb-canvas')).toBeTruthy();
    expect(queryByTestId('static-orb-fallback')).toBeNull();
  });
});
