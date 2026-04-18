import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#fff', textSecondary: '#999' },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Ellipse: (props: any) => <View testID="svg-ellipse" {...props} />,
    Defs: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    RadialGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stop: (props: any) => <View {...props} />,
    Rect: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
    Path: (props: any) => <View {...props} />,
  };
});

import { BadgeOrb } from '../BadgeOrb';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const MOCK_COLORS: BadgeColorTriad = {
  core: '#FFB547',
  glow: '#FFE4A0',
  accent: '#FF7847',
};

// SolarSystem バッジの実際の colors
const SOLAR_SYSTEM_COLORS: BadgeColorTriad = {
  core: '#5CE1E6',
  glow: '#B8F5F7',
  accent: '#1E6B7F',
};

describe('BadgeOrb', () => {
  it('unlocked のとき testID="badge-orb-unlocked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="ignition" />,
    );
    expect(screen.getByTestId('badge-orb-unlocked')).toBeTruthy();
  });

  it('locked のとき testID="badge-orb-locked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    expect(screen.getByTestId('badge-orb-locked')).toBeTruthy();
  });

  it('locked のとき opacity 0.3 が適用される', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    const container = screen.getByTestId('badge-orb-locked');
    // Flatten style array into single object for inspection
    const flat = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;
    expect(flat.opacity).toBe(0.3);
  });

  it('locked のとき LinearGradient に colors が渡される', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="ignition" />,
    );
    const gradient = screen.getByTestId('badge-orb-locked-gradient');
    expect(gradient.props.colors).toEqual([
      MOCK_COLORS.core,
      MOCK_COLORS.glow,
      MOCK_COLORS.accent,
    ]);
  });
});

describe('SaturnRing 特殊描画', () => {
  it('badgeId="SolarSystem" のとき saturn-ring が描画される', () => {
    render(
      <BadgeOrb
        colors={SOLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="SolarSystem"
      />,
    );
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('badgeId="SolarSystem" かつ locked でも saturn-ring が描画される', () => {
    render(
      <BadgeOrb
        colors={SOLAR_SYSTEM_COLORS}
        isUnlocked={false}
        chapterId="expansion"
        badgeId="SolarSystem"
      />,
    );
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('badgeId="Ignition" のとき saturn-ring は描画されない', () => {
    render(
      <BadgeOrb
        colors={MOCK_COLORS}
        isUnlocked
        chapterId="ignition"
        badgeId="Ignition"
      />,
    );
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });

  it('badgeId なしのとき saturn-ring は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="ignition" />,
    );
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });

  it('saturn-ring の stroke カラーは SolarSystem の glow カラーに基づく', () => {
    render(
      <BadgeOrb
        colors={SOLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="SolarSystem"
      />,
    );
    // svg-ellipse は SaturnRing 内の Ellipse モック
    const ellipses = screen.queryAllByTestId('svg-ellipse');
    // SaturnRing の Ellipse が存在する
    expect(ellipses.length).toBeGreaterThan(0);
    // stroke カラーが SolarSystem.glow (#B8F5F7) を含む
    const ringEllipse = ellipses.find(
      (el) => el.props.stroke === SOLAR_SYSTEM_COLORS.glow,
    );
    expect(ringEllipse).toBeTruthy();
  });
});

// BinaryStars バッジの colors
const BINARY_STARS_COLORS: BadgeColorTriad = {
  core: '#00D4FF',
  glow: '#80ECFF',
  accent: '#0088AA',
};

describe('StellarSystemOverlay 特殊描画', () => {
  it('badgeId="BinaryStars" のとき stellar-system-overlay が描画される', () => {
    render(
      <BadgeOrb
        colors={BINARY_STARS_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="BinaryStars"
      />,
    );
    expect(screen.getByTestId('stellar-system-overlay')).toBeTruthy();
  });

  it('badgeId="BinaryStars" のとき軌道円（orbital-ring）が複数描画される', () => {
    render(
      <BadgeOrb
        colors={BINARY_STARS_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="BinaryStars"
      />,
    );
    const orbitalRings = screen.getAllByTestId('orbital-ring');
    expect(orbitalRings.length).toBeGreaterThanOrEqual(2);
  });

  it('badgeId="BinaryStars" のとき惑星ドット（planet-dot）が軌道数と同数描画される', () => {
    render(
      <BadgeOrb
        colors={BINARY_STARS_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="BinaryStars"
      />,
    );
    const rings = screen.getAllByTestId('orbital-ring');
    const dots = screen.getAllByTestId('planet-dot');
    expect(dots.length).toBe(rings.length);
  });

  it('badgeId="SolarSystem" のとき stellar-system-overlay は描画されない', () => {
    render(
      <BadgeOrb
        colors={SOLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="expansion"
        badgeId="SolarSystem"
      />,
    );
    expect(screen.queryByTestId('stellar-system-overlay')).toBeNull();
  });

  it('badgeId なしのとき stellar-system-overlay は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="ignition" />,
    );
    expect(screen.queryByTestId('stellar-system-overlay')).toBeNull();
  });
});

// Galaxy バッジの colors
const GALAXY_COLORS: BadgeColorTriad = {
  core: '#EC4899',
  glow: '#FBCFE8',
  accent: '#831843',
};

describe('GalaxySpiral 特殊描画', () => {
  it('badgeId="Galaxy" のとき galaxy-spiral が描画される', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="transcendence"
        badgeId="Galaxy"
      />,
    );
    expect(screen.getByTestId('galaxy-spiral')).toBeTruthy();
  });

  it('badgeId="Galaxy" のとき渦巻きアーム（galaxy-spiral-arm）が2本描画される', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="transcendence"
        badgeId="Galaxy"
      />,
    );
    const arms = screen.getAllByTestId('galaxy-spiral-arm');
    expect(arms.length).toBe(2);
  });

  it('badgeId="GalaxyCluster" のとき galaxy-spiral は描画されない', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="transcendence"
        badgeId="GalaxyCluster"
      />,
    );
    expect(screen.queryByTestId('galaxy-spiral')).toBeNull();
  });

  it('badgeId なしのとき galaxy-spiral は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="ignition" />,
    );
    expect(screen.queryByTestId('galaxy-spiral')).toBeNull();
  });
});
