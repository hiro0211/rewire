import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AnimatedOrb } from '../AnimatedOrb';
import { CHAPTER_IDS } from '@/constants/badges/BadgeChapter';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

jest.mock('../PlanetOrbRenderer', () => {
  const { View } = require('react-native');
  return {
    PlanetOrbRenderer: (props: Record<string, unknown>) => (
      <View testID={`planet-orb-fallback-${props.badgeId}`} {...props} />
    ),
  };
});

jest.mock('../CosmicFieldRenderer', () => {
  const { View } = require('react-native');
  return {
    CosmicFieldRenderer: (props: Record<string, unknown>) => (
      <View testID={`cosmic-field-${props.badgeId}`} {...props} />
    ),
  };
});

jest.mock('../SaturnRingOverlay', () => {
  const { View } = require('react-native');
  return {
    SaturnRingOverlay: (props: Record<string, unknown>) => (
      <View testID="saturn-ring" {...props} />
    ),
  };
});

const testColors: BadgeColorTriad = {
  core: '#B8A9D4',
  mid: '#D0C4E4',
  outer: '#7B68AE',
  glow: '#E8E0F0',
};

describe('AnimatedOrb', () => {
  it('コンテナをレンダリングする', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('全6チャプターでレンダリングできる', () => {
    for (const chapter of CHAPTER_IDS) {
      const { unmount } = render(<AnimatedOrb colors={testColors} chapterId={chapter} />);
      expect(screen.getByTestId('animated-orb')).toBeTruthy();
      unmount();
    }
  });

  it('sizeプロパティを受け取れる', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" size={150} />);
    expect(screen.getByTestId('animated-orb')).toBeTruthy();
  });

  it('3層のグローエフェクトを表示する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="terrestrial" />);
    expect(screen.getByTestId('orb-glow-inner')).toBeTruthy();
    expect(screen.getByTestId('orb-glow-outer')).toBeTruthy();
    expect(screen.getByTestId('orb-pulse-ring')).toBeTruthy();
  });

  it('パーティクルエフェクトを表示する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="outerPlanets" />);
    expect(screen.getByTestId('orb-particles')).toBeTruthy();
  });

  it('Pressableが存在する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('orb-pressable')).toBeTruthy();
  });

  it('onPress が発火する', () => {
    const onPress = jest.fn();
    render(<AnimatedOrb colors={testColors} chapterId="birth" onPress={onPress} />);
    fireEvent.press(screen.getByTestId('orb-pressable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('onLongPress が発火する', () => {
    const onLongPress = jest.fn();
    render(<AnimatedOrb colors={testColors} chapterId="birth" onLongPress={onLongPress} />);
    fireEvent(screen.getByTestId('orb-pressable'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('波紋エフェクト要素が存在する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('orb-tap-ripple')).toBeTruthy();
  });

  it('badgeIdなしの場合はCoreOrbRendererを描画する', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.getByTestId('orb-canvas')).toBeTruthy();
    expect(screen.queryByTestId('planet-orb-fallback-earth')).toBeNull();
  });

  it.each([
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'moon',
    'sun',
  ] as const)('badgeId="%s"の場合はPlanetOrbRendererを描画する', (id) => {
    render(<AnimatedOrb colors={testColors} chapterId="terrestrial" badgeId={id} />);
    expect(screen.getByTestId(`planet-orb-fallback-${id}`)).toBeTruthy();
    expect(screen.queryByTestId('orb-canvas')).toBeNull();
  });

  it.each([
    'stardust',
    'nebula',
    'protostar',
    'whiteDwarf',
    'stellarSystem',
    'starCluster',
    'galaxy',
    'cosmos',
  ] as const)(
    '宇宙バッジ %s では CosmicFieldRenderer を描画する（CoreOrbRenderer ではない）',
    (id) => {
      render(<AnimatedOrb colors={testColors} chapterId="cosmic" badgeId={id} />);
      expect(screen.getByTestId(`cosmic-field-${id}`)).toBeTruthy();
      expect(screen.queryByTestId('orb-canvas')).toBeNull();
    },
  );

  it('badgeId="saturn" のとき SaturnRingOverlay も描画される', () => {
    render(<AnimatedOrb colors={testColors} chapterId="outerPlanets" badgeId="saturn" />);
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('badgeId="earth" のとき SaturnRingOverlay は描画されない', () => {
    render(<AnimatedOrb colors={testColors} chapterId="terrestrial" badgeId="earth" />);
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });

  it('badgeId なしのとき SaturnRingOverlay は描画されない', () => {
    render(<AnimatedOrb colors={testColors} chapterId="birth" />);
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });
});
