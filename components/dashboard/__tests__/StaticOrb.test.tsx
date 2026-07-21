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

jest.mock('../PlanetOrbRenderer', () => {
  const { View } = require('react-native');
  return {
    PlanetOrbRenderer: (props: any) => (
      <View testID={`planet-orb-${props.badgeId}`} {...props} />
    ),
  };
});

jest.mock('../CosmicFieldRenderer', () => {
  const { View } = require('react-native');
  return {
    CosmicFieldRenderer: (props: any) => (
      <View testID={`cosmic-field-${props.badgeId}`} {...props} />
    ),
  };
});

import { StaticOrb } from '../StaticOrb';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const testColors: BadgeColorTriad = {
  core: '#FF0000',
  mid: '#FFAA00',
  outer: '#FF6600',
  glow: '#FF8800',
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

  it('badgeId なしのとき CoreOrbRenderer（static-orb-canvas）を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <StaticOrb colors={testColors} size={100} />
    );
    expect(getByTestId('static-orb-canvas')).toBeTruthy();
    expect(queryByTestId('planet-orb-earth')).toBeNull();
    expect(queryByTestId('cosmic-field-nebula')).toBeNull();
  });

  it('badgeId="earth"（惑星）のとき PlanetOrbRenderer を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <StaticOrb colors={testColors} size={100} badgeId="earth" />
    );
    expect(getByTestId('planet-orb-earth')).toBeTruthy();
    expect(queryByTestId('static-orb-canvas')).toBeNull();
  });

  it('badgeId="nebula"（宇宙）のとき CosmicFieldRenderer を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <StaticOrb colors={testColors} size={100} badgeId="nebula" />
    );
    expect(getByTestId('cosmic-field-nebula')).toBeTruthy();
    expect(queryByTestId('static-orb-canvas')).toBeNull();
  });
});
