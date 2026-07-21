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

describe('宇宙フィールド描画: stellarSystem', () => {
  it('unlocked のとき cosmic-field-fallback を描画し SVG overlay は抑止する', () => {
    render(
      <BadgeOrb
        colors={STELLAR_SYSTEM_COLORS}
        isUnlocked
        chapterId="stellar"
        badgeId="stellarSystem"
      />,
    );
    expect(screen.getByTestId('cosmic-field-fallback')).toBeTruthy();
    expect(screen.queryByTestId('stellar-system-overlay')).toBeNull();
    expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
  });

  it('locked のとき従来のゴースト（badge-orb-locked-gradient）を維持する', () => {
    render(
      <BadgeOrb
        colors={STELLAR_SYSTEM_COLORS}
        isUnlocked={false}
        chapterId="stellar"
        badgeId="stellarSystem"
      />,
    );
    expect(screen.getByTestId('badge-orb-locked-gradient')).toBeTruthy();
    expect(screen.queryByTestId('cosmic-field-fallback')).toBeNull();
  });
});

// starCluster バッジの colors
const STAR_CLUSTER_COLORS: BadgeColorTriad = {
  core: '#38BDF8',
  mid: '#60CCF8',
  outer: '#0284C7',
  glow: '#BAE6FD',
};

describe('宇宙フィールド描画: starCluster', () => {
  it('unlocked のとき cosmic-field-fallback を描画し SVG overlay は抑止する', () => {
    render(
      <BadgeOrb
        colors={STAR_CLUSTER_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="starCluster"
      />,
    );
    expect(screen.getByTestId('cosmic-field-fallback')).toBeTruthy();
    expect(screen.queryByTestId('star-cluster-overlay')).toBeNull();
    expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
  });
});

// cosmos バッジの colors
const COSMOS_COLORS: BadgeColorTriad = {
  core: '#F43F5E',
  mid: '#FB7185',
  outer: '#9F1239',
  glow: '#FFE4E8',
};

describe('宇宙フィールド描画: cosmos', () => {
  it('unlocked のとき cosmic-field-fallback を描画し SVG overlay は抑止する', () => {
    render(
      <BadgeOrb
        colors={COSMOS_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="cosmos"
      />,
    );
    expect(screen.getByTestId('cosmic-field-fallback')).toBeTruthy();
    expect(screen.queryByTestId('cosmos-overlay')).toBeNull();
    expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
  });
});

// earth バッジの colors（実際の BADGE_DEFINITIONS に揃える）
const EARTH_COLORS: BadgeColorTriad = {
  core: '#3B5CE6',
  mid: '#4A90E2',
  outer: '#1E3A8A',
  glow: '#7DD3E8',
};

describe('Planet 実写描画', () => {
  it.each([
    ['mercury', 'innerPlanets'],
    ['venus', 'innerPlanets'],
    ['earth', 'terrestrial'],
    ['mars', 'terrestrial'],
    ['jupiter', 'terrestrial'],
    ['saturn', 'outerPlanets'],
    ['uranus', 'outerPlanets'],
    ['neptune', 'outerPlanets'],
    ['moon', 'innerPlanets'],
    ['sun', 'stellar'],
  ] as const)('badgeId="%s" のとき PlanetOrbRenderer が描画される（テスト環境では fallback）', (id, chapter) => {
    render(
      <BadgeOrb
        colors={EARTH_COLORS}
        isUnlocked
        chapterId={chapter}
        badgeId={id}
      />,
    );
    expect(screen.getByTestId('planet-orb-fallback')).toBeTruthy();
  });

  it('badgeId="earth" のとき badge-orb-canvas（CoreOrbRenderer）は描画されない', () => {
    render(
      <BadgeOrb
        colors={EARTH_COLORS}
        isUnlocked
        chapterId="terrestrial"
        badgeId="earth"
      />,
    );
    expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
  });

  it('抽象バッジ（galaxy）では planet-orb-fallback は描画されない', () => {
    render(
      <BadgeOrb
        colors={MOCK_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    expect(screen.queryByTestId('planet-orb-fallback')).toBeNull();
  });

  it('badgeId なしのとき planet-orb-fallback は描画されない', () => {
    render(
      <BadgeOrb colors={MOCK_COLORS} isUnlocked chapterId="innerPlanets" />,
    );
    expect(screen.queryByTestId('planet-orb-fallback')).toBeNull();
  });
});

// galaxy バッジの colors
const GALAXY_COLORS: BadgeColorTriad = {
  core: '#A855F7',
  mid: '#C084FC',
  outer: '#6B21A8',
  glow: '#E9D5FF',
};

describe('宇宙フィールド描画: galaxy', () => {
  it('unlocked のとき cosmic-field-fallback を描画し SVG overlay は抑止する', () => {
    render(
      <BadgeOrb
        colors={GALAXY_COLORS}
        isUnlocked
        chapterId="cosmic"
        badgeId="galaxy"
      />,
    );
    expect(screen.getByTestId('cosmic-field-fallback')).toBeTruthy();
    expect(screen.queryByTestId('galaxy-spiral')).toBeNull();
    expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
  });
});

describe('宇宙フィールド描画: 全 cosmic バッジ網羅', () => {
  it.each([
    ['stardust', 'birth'],
    ['nebula', 'birth'],
    ['protostar', 'birth'],
    ['whiteDwarf', 'stellar'],
    ['stellarSystem', 'stellar'],
    ['starCluster', 'cosmic'],
    ['galaxy', 'cosmic'],
    ['cosmos', 'cosmic'],
  ] as const)(
    'unlocked の %s は cosmic-field-fallback を描画し CoreOrbRenderer は使わない',
    (id, chapter) => {
      render(
        <BadgeOrb
          colors={MOCK_COLORS}
          isUnlocked
          chapterId={chapter}
          badgeId={id}
        />,
      );
      expect(screen.getByTestId('cosmic-field-fallback')).toBeTruthy();
      expect(screen.queryByTestId('badge-orb-canvas')).toBeNull();
      expect(screen.queryByTestId('planet-orb-fallback')).toBeNull();
    },
  );
});
