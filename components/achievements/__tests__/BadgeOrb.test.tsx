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
  core: '#D4D4D8',
  mid: '#E8E8EC',
  outer: '#9CA3AF',
  glow: '#F4F4F5',
};

// saturn バッジの実際の colors
const SATURN_COLORS: BadgeColorTriad = {
  core: '#E8C87A',
  mid: '#F0DCA0',
  outer: '#C4A050',
  glow: '#FFF0C0',
};

describe('BadgeOrb', () => {
  it('unlocked のとき testID="badge-orb-unlocked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.getByTestId('badge-orb-unlocked')).toBeTruthy();
  });

  it('locked のとき testID="badge-orb-locked" を持つコンテナを描画する', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="innerPlanets" />,
    );
    expect(screen.getByTestId('badge-orb-locked')).toBeTruthy();
  });

  it('locked のとき opacity 0.3 が適用される', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="innerPlanets" />,
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
      <BadgeOrb colors={MOCK_COLORS} isUnlocked={false} chapterId="innerPlanets" />,
    );
    const gradient = screen.getByTestId('badge-orb-locked-gradient');
    expect(gradient.props.colors).toEqual([
      MOCK_COLORS.core,
      MOCK_COLORS.mid,
      MOCK_COLORS.outer,
    ]);
  });
});

describe('SaturnRing 特殊描画', () => {
  it('badgeId="saturn" のとき saturn-ring が描画される', () => {
    render(
      <BadgeOrb
        colors={SATURN_COLORS}
        isUnlocked
        chapterId="outerPlanets"
        badgeId="saturn"
      />,
    );
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('badgeId="saturn" かつ locked でも saturn-ring が描画される', () => {
    render(
      <BadgeOrb
        colors={SATURN_COLORS}
        isUnlocked={false}
        chapterId="outerPlanets"
        badgeId="saturn"
      />,
    );
    expect(screen.getByTestId('saturn-ring')).toBeTruthy();
  });

  it('badgeId="moon" のとき saturn-ring は描画されない', () => {
    render(
      <BadgeOrb
        colors={MOCK_COLORS}
        isUnlocked
        chapterId="innerPlanets"
        badgeId="moon"
      />,
    );
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });

  it('badgeId なしのとき saturn-ring は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('saturn-ring')).toBeNull();
  });

  it('saturn-ring の stroke カラーは saturn の glow カラーに基づく', () => {
    render(
      <BadgeOrb
        colors={SATURN_COLORS}
        isUnlocked
        chapterId="outerPlanets"
        badgeId="saturn"
      />,
    );
    // svg-ellipse は SaturnRing 内の Ellipse モック
    const ellipses = screen.queryAllByTestId('svg-ellipse');
    // SaturnRing の Ellipse が存在する
    expect(ellipses.length).toBeGreaterThan(0);
    // stroke カラーが saturn.glow (#FFF0C0) を含む
    const ringEllipse = ellipses.find(
      (el) => el.props.stroke === SATURN_COLORS.glow,
    );
    expect(ringEllipse).toBeTruthy();
  });
});

// stellarSystem バッジの colors
const STELLAR_SYSTEM_COLORS: BadgeColorTriad = {
  core: '#5CE1E6',
  mid: '#80EAF0',
  outer: '#1E6B7F',
  glow: '#B8F5F7',
};

describe('StellarSystemOverlay 特殊描画', () => {
  it('badgeId="stellarSystem" のとき stellar-system-overlay が描画される', () => {
    render(
      <BadgeOrb
        colors={STELLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="stellar"
        badgeId="stellarSystem"
      />,
    );
    expect(screen.getByTestId('stellar-system-overlay')).toBeTruthy();
  });

  it('badgeId="stellarSystem" のとき軌道円（orbital-ring）が複数描画される', () => {
    render(
      <BadgeOrb
        colors={STELLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="stellar"
        badgeId="stellarSystem"
      />,
    );
    const orbitalRings = screen.getAllByTestId('orbital-ring');
    expect(orbitalRings.length).toBeGreaterThanOrEqual(2);
  });

  it('badgeId="stellarSystem" のとき惑星ドット（planet-dot）が軌道数と同数描画される', () => {
    render(
      <BadgeOrb
        colors={STELLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="stellar"
        badgeId="stellarSystem"
      />,
    );
    const rings = screen.getAllByTestId('orbital-ring');
    const dots = screen.getAllByTestId('planet-dot');
    expect(dots.length).toBe(rings.length);
  });

  it('badgeId="saturn" のとき stellar-system-overlay は描画されない', () => {
    render(
      <BadgeOrb
        colors={SATURN_COLORS}
        isUnlocked
        chapterId="outerPlanets"
        badgeId="saturn"
      />,
    );
    expect(screen.queryByTestId('stellar-system-overlay')).toBeNull();
  });

  it('badgeId なしのとき stellar-system-overlay は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('stellar-system-overlay')).toBeNull();
  });
});

// starCluster バッジの colors
const STAR_CLUSTER_COLORS: BadgeColorTriad = {
  core: '#38BDF8',
  mid: '#60CCF8',
  outer: '#0284C7',
  glow: '#BAE6FD',
};

describe('StarClusterOverlay 特殊描画', () => {
  it('badgeId="starCluster" のとき star-cluster-overlay が描画される', () => {
    render(
      <BadgeOrb
        colors={STAR_CLUSTER_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="starCluster"
      />,
    );
    expect(screen.getByTestId('star-cluster-overlay')).toBeTruthy();
  });

  it('badgeId="starCluster" のとき周辺小球（star-cluster-satellite）が5個以上描画される', () => {
    render(
      <BadgeOrb
        colors={STAR_CLUSTER_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="starCluster"
      />,
    );
    const satellites = screen.getAllByTestId('star-cluster-satellite');
    expect(satellites.length).toBeGreaterThanOrEqual(5);
  });

  it('badgeId="galaxy" のとき star-cluster-overlay は描画されない', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    expect(screen.queryByTestId('star-cluster-overlay')).toBeNull();
  });

  it('badgeId なしのとき star-cluster-overlay は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('star-cluster-overlay')).toBeNull();
  });
});

// cosmos バッジの colors
const COSMOS_COLORS: BadgeColorTriad = {
  core: '#F43F5E',
  mid: '#FB7185',
  outer: '#9F1239',
  glow: '#FFE4E8',
};

describe('CosmosOverlay 特殊描画', () => {
  it('badgeId="cosmos" のとき cosmos-overlay が描画される', () => {
    render(
      <BadgeOrb
        colors={COSMOS_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="cosmos"
      />,
    );
    expect(screen.getByTestId('cosmos-overlay')).toBeTruthy();
  });

  it('badgeId="cosmos" のとき光点（cosmos-particle）が20個以上描画される', () => {
    render(
      <BadgeOrb
        colors={COSMOS_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="cosmos"
      />,
    );
    const particles = screen.getAllByTestId('cosmos-particle');
    expect(particles.length).toBeGreaterThanOrEqual(20);
  });

  it('badgeId="galaxy" のとき cosmos-overlay は描画されない', () => {
    render(
      <BadgeOrb
        colors={COSMOS_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    expect(screen.queryByTestId('cosmos-overlay')).toBeNull();
  });

  it('badgeId なしのとき cosmos-overlay は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('cosmos-overlay')).toBeNull();
  });
});

// galaxy バッジの colors
const GALAXY_COLORS: BadgeColorTriad = {
  core: '#A855F7',
  mid: '#C084FC',
  outer: '#6B21A8',
  glow: '#E9D5FF',
};

describe('GalaxySpiral 特殊描画', () => {
  it('badgeId="galaxy" のとき galaxy-spiral が描画される', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    expect(screen.getByTestId('galaxy-spiral')).toBeTruthy();
  });

  it('badgeId="galaxy" のとき渦巻きアーム（galaxy-spiral-arm）が2本描画される', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    const arms = screen.getAllByTestId('galaxy-spiral-arm');
    expect(arms.length).toBe(2);
  });

  it('badgeId="cosmos" のとき galaxy-spiral は描画されない', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="cosmos"
      />,
    );
    expect(screen.queryByTestId('galaxy-spiral')).toBeNull();
  });

  it('badgeId なしのとき galaxy-spiral は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('galaxy-spiral')).toBeNull();
  });
});
