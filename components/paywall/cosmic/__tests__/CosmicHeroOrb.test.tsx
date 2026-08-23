import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

jest.mock('@/lib/nativeGuard', () => ({ isExpoGo: true }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

let mockCycledBadgeId = 'moon';
jest.mock('@/hooks/paywall/useHeroPlanetCycle', () => ({
  useHeroPlanetCycle: () => mockCycledBadgeId,
}));

import { HERO_ORB_SIZE } from '@/constants/paywall/heroPlanets';
import { CosmicHeroOrb } from '../CosmicHeroOrb';

describe('CosmicHeroOrb', () => {
  beforeEach(() => {
    mockCycledBadgeId = 'moon';
  });

  it('レンダリングしたとき天体が描画される', () => {
    const { getByTestId } = render(<CosmicHeroOrb />);

    expect(getByTestId('cosmic-hero-orb')).toBeTruthy();
    expect(getByTestId('animated-orb')).toBeTruthy();
  });

  it('プロフィール画面の天体と同じ大きさで描く', () => {
    // components/profile/ProfileHeader.tsx が size={120}。
    // 画面幅から算出すると端末ごとに別の大きさになり、プロフィールと揃わない
    const { getByTestId } = render(<CosmicHeroOrb />);
    const box = StyleSheet.flatten(getByTestId('animated-orb').props.style) as {
      width?: number;
    };

    // AnimatedOrb はグロー用に size の2倍の箱を確保する
    expect(box.width).toBe(HERO_ORB_SIZE * 2);
  });

  it('レンダリングしたときトラックの StaticOrb を使わない', () => {
    // ヒーローは AnimatedOrb 経路。ここで static-orb が出ると
    // 画面全体の「トラックの天体5個」判定に混入して数が狂う
    const { queryByTestId } = render(<CosmicHeroOrb />);

    expect(queryByTestId('static-orb')).toBeNull();
  });

  it('badgeId を渡したときそのバッジに固定される', () => {
    const { getByTestId } = render(<CosmicHeroOrb badgeId="earth" />);

    expect(getByTestId('planet-orb-fallback')).toBeTruthy();
  });

  it('未指定のとき惑星（月）から始まる', () => {
    // 巡回の先頭は月。deep-sky ではなく惑星の描画経路になる
    const { getByTestId } = render(<CosmicHeroOrb />);

    expect(getByTestId('planet-orb-fallback')).toBeTruthy();
  });

  // BADGE_DEFINITIONS の core カラー。天体ごとに違うので、
  // どの天体を描いているかの判別に使える
  const MOON_CORE = '#D4D4D8';
  const MERCURY_CORE = '#A8A29E';
  const EARTH_CORE = '#4A90E2';

  function renderedColors(tree: unknown): string {
    return JSON.stringify(tree);
  }

  // 巡回のタイミング自体は useHeroPlanetCycle のテストで担保する。
  // ここでフェイクタイマーを回すと reanimated の useFrameCallback の
  // 解除処理と噛み合わず、製品コードと無関係な理由で落ちる。
  // このファイルの責任は「フックが返した天体を描いているか」だけに絞る。
  it('巡回中の天体をそのまま描画する', () => {
    mockCycledBadgeId = 'mercury';

    const { toJSON } = render(<CosmicHeroOrb />);

    expect(renderedColors(toJSON())).toContain(MERCURY_CORE);
  });

  it('badgeId を渡したとき巡回より優先される', () => {
    // トラック側やテストから特定の天体を出したいときに、巡回に奪われては困る
    mockCycledBadgeId = 'mercury';

    const { toJSON } = render(<CosmicHeroOrb badgeId="earth" />);

    const json = renderedColors(toJSON());
    expect(json).toContain(EARTH_CORE);
    expect(json).not.toContain(MERCURY_CORE);
  });
});
