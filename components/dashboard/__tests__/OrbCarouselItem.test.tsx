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
    useAnimatedReaction: () => {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} />,
    Defs: (props: any) => <View {...props} />,
    RadialGradient: (props: any) => <View {...props} />,
    Stop: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
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

jest.mock('../PlanetOrbRenderer', () => {
  const { View } = require('react-native');
  return {
    PlanetOrbRenderer: (props: any) => (
      <View testID={`planet-orb-fallback-${props.badgeId}`} {...props} />
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

import { OrbCarouselItem } from '../OrbCarouselItem';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';

const planetesimal = BADGE_DEFINITIONS.find((b) => b.id === 'mars')!;
const earthBadge = BADGE_DEFINITIONS.find((b) => b.id === 'earth')!;
const nebulaBadge = BADGE_DEFINITIONS.find((b) => b.id === 'nebula')!;

function getFlatStyle(node: any) {
  return Array.isArray(node.props.style)
    ? Object.assign({}, ...node.props.style.filter(Boolean))
    : node.props.style;
}

describe('OrbCarouselItem', () => {
  it('badge.nameJaを日本語モードで表示する', () => {
    const { getByText } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={45}
      />
    );
    expect(getByText('火星')).toBeTruthy();
  });

  it('badge.day 日数を表示する', () => {
    const { getByText } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={45}
      />
    );
    expect(getByText('45日')).toBeTruthy();
  });

  it('active + unlocked のとき animated-orb を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={45}
      />
    );
    expect(getByTestId('animated-orb')).toBeTruthy();
    expect(queryByTestId('static-orb')).toBeNull();
  });

  it('inactive + unlocked のとき static-orb を描画し animated-orb は描画しない', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
      />
    );
    expect(getByTestId('static-orb')).toBeTruthy();
    expect(queryByTestId('animated-orb')).toBeNull();
  });

  it('inactive + unlocked のとき scale 0.55 と opacity 0.55 が適用される', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
      />
    );
    const flatStyle = getFlatStyle(getByTestId('static-orb-wrapper'));
    expect(flatStyle.opacity).toBe(0.55);
    expect(flatStyle.transform).toContainEqual({ scale: 0.55 });
  });

  it('active + locked のとき animated-orb を描画せず static-orb を描画する', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={0}
      />
    );
    expect(queryByTestId('animated-orb')).toBeNull();
    expect(getByTestId('static-orb')).toBeTruthy();
  });

  it('active + locked のとき opacity 0.4 が適用される', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={0}
      />
    );
    const flatStyle = getFlatStyle(getByTestId('static-orb-wrapper'));
    expect(flatStyle.opacity).toBe(0.4);
  });

  it('inactive + locked のとき opacity 0.3 が適用される', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={0}
      />
    );
    const flatStyle = getFlatStyle(getByTestId('static-orb-wrapper'));
    expect(flatStyle.opacity).toBe(0.3);
  });

  it('locked のとき accessibilityLabel に「未達成」が含まれる', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={0}
      />
    );
    const wrapper = getByTestId('static-orb-wrapper');
    expect(wrapper.props.accessibilityLabel).toContain('未達成');
  });

  it('unlocked のとき accessibilityLabel に「未達成」が含まれない', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
      />
    );
    const wrapper = getByTestId('static-orb-wrapper');
    expect(wrapper.props.accessibilityLabel).not.toContain('未達成');
  });

  it('active + unlocked 長押しで onLongPress が発火する', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={45}
        onLongPress={onLongPress}
      />
    );
    fireEvent(getByTestId('orb-carousel-item-active-touch'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('inactive では onLongPress 用タッチハンドラが存在しない', () => {
    const onLongPress = jest.fn();
    const { queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
        onLongPress={onLongPress}
      />
    );
    expect(queryByTestId('orb-carousel-item-active-touch')).toBeNull();
  });

  it('earthバッジのとき AnimatedOrb に badgeId="earth" が渡される', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={earthBadge}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={100}
      />
    );
    expect(getByTestId('planet-orb-fallback-earth')).toBeTruthy();
  });

  it('marsバッジのとき PlanetOrbRenderer に badgeId="mars" が渡される', () => {
    const { getByTestId, queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive
        currentDays={100}
      />
    );
    expect(getByTestId('planet-orb-fallback-mars')).toBeTruthy();
    expect(queryByTestId('orb-canvas')).toBeNull();
  });

  it('inactive + unlocked の惑星バッジは StaticOrb に badgeId が渡り実写が出る', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
      />
    );
    // StaticOrb（実体）が mock PlanetOrbRenderer を描画する
    expect(getByTestId('planet-orb-fallback-mars')).toBeTruthy();
  });

  it('inactive + unlocked の宇宙バッジは StaticOrb で CosmicFieldRenderer が出る', () => {
    const { getByTestId } = render(
      <OrbCarouselItem
        badge={nebulaBadge}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={100}
      />
    );
    expect(getByTestId('cosmic-field-nebula')).toBeTruthy();
  });

  it('locked のとき StaticOrb に badgeId は渡らずゴースト（実写なし）', () => {
    const { queryByTestId } = render(
      <OrbCarouselItem
        badge={planetesimal}
        itemWidth={280}
        activeOrbSize={120}
        isActive={false}
        currentDays={0}
      />
    );
    expect(queryByTestId('planet-orb-fallback-mars')).toBeNull();
    expect(queryByTestId('cosmic-field-mars')).toBeNull();
  });
});
