import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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
    colors: {
      text: '#FFFFFF',
      textSecondary: '#888888',
    },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ isJapanese: true }),
}));

import { OrbCarouselItem } from '../OrbCarouselItem';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';

const planetesimal = BADGE_DEFINITIONS.find((b) => b.id === 'Planetesimal')!;

describe('OrbCarouselItem', () => {
  it('badge.nameJaを日本語モードで表示する', () => {
    const { getByText } = render(
      <OrbCarouselItem badge={planetesimal} itemWidth={280} activeOrbSize={200} isActive />
    );
    expect(getByText('微惑星')).toBeTruthy();
  });

  it('badge.day 日数を表示する', () => {
    const { getByText } = render(
      <OrbCarouselItem badge={planetesimal} itemWidth={280} activeOrbSize={200} isActive />
    );
    expect(getByText('45日')).toBeTruthy();
  });

  it('isActive=true のとき animated-orb を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem badge={planetesimal} itemWidth={280} activeOrbSize={200} isActive />
    );
    expect(getByTestId('animated-orb')).toBeTruthy();
    expect(queryByTestId('static-orb')).toBeNull();
  });

  it('isActive=false のとき static-orb を描画し animated-orb は描画しない', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={200}
        isActive={false}
      />
    );
    expect(getByTestId('static-orb')).toBeTruthy();
    expect(queryByTestId('animated-orb')).toBeNull();
  });

  it('isActive=false のとき静的オーブに scale 0.55 と opacity 0.4 が適用される', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={200}
        isActive={false}
      />
    );
    const staticOrbWrapper = getByTestId('static-orb-wrapper');
    const flatStyle = Array.isArray(staticOrbWrapper.props.style)
      ? Object.assign({}, ...staticOrbWrapper.props.style.filter(Boolean))
      : staticOrbWrapper.props.style;
    expect(flatStyle.opacity).toBe(0.4);
    expect(flatStyle.transform).toContainEqual({ scale: 0.55 });
  });

  it('isActive=true 長押しで onLongPress が発火する', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={200}
        isActive
        onLongPress={onLongPress}
      />
    );
    fireEvent(getByTestId('orb-carousel-item-active-touch'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('isActive=false では onLongPress 用タッチハンドラが存在しない', () => {
    const onLongPress = jest.fn();
    const { queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={200}
        isActive={false}
        onLongPress={onLongPress}
      />
    );
    expect(queryByTestId('orb-carousel-item-active-touch')).toBeNull();
  });
});
