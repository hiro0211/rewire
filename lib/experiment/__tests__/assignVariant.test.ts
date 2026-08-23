import { assignVariant } from '../assignVariant';

const ARMS = ['control', 'treatment'] as const;
type Arm = (typeof ARMS)[number];

/** 固定シードのLCGで種を生成し、失敗時に同じ入力で再現できるようにする */
function makeSeeds(count: number): string[] {
  let state = 0x9e3779b9;
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return `seed-${state.toString(16)}`;
  });
}

function shareOf(arm: Arm, weights: Readonly<Record<Arm, number>>): number {
  const seeds = makeSeeds(2000);
  const hits = seeds.filter((seed) => assignVariant(seed, ARMS, weights) === arm).length;
  return hits / seeds.length;
}

describe('assignVariant', () => {
  it('同じ種のとき常に同じアームを返す', () => {
    const first = assignVariant('user-abc', ARMS, { control: 1, treatment: 1 });

    expect(assignVariant('user-abc', ARMS, { control: 1, treatment: 1 })).toBe(first);
  });

  it('重みが等しいとき第1アームが45〜55%になる', () => {
    const share = shareOf('control', { control: 1, treatment: 1 });

    expect(share).toBeGreaterThan(0.45);
    expect(share).toBeLessThan(0.55);
  });

  it('重みが等しいとき第2アームが45〜55%になる', () => {
    const share = shareOf('treatment', { control: 1, treatment: 1 });

    expect(share).toBeGreaterThan(0.45);
    expect(share).toBeLessThan(0.55);
  });

  it('重みが9対1のとき第2アームが5〜15%になる', () => {
    const share = shareOf('treatment', { control: 9, treatment: 1 });

    expect(share).toBeGreaterThan(0.05);
    expect(share).toBeLessThan(0.15);
  });

  it('重みが0のアームは選ばれない', () => {
    const share = shareOf('treatment', { control: 1, treatment: 0 });

    expect(share).toBe(0);
  });

  it('重みの合計が0のとき先頭アームを返す', () => {
    expect(assignVariant('user-abc', ARMS, { control: 0, treatment: 0 })).toBe('control');
  });

  it('重みが負のとき先頭アームを返す', () => {
    expect(assignVariant('user-abc', ARMS, { control: -1, treatment: -2 })).toBe('control');
  });

  it('先頭アームの重みが0でも残りのアームに全量が割り当てられる', () => {
    const share = shareOf('treatment', { control: 0, treatment: 1 });

    expect(share).toBe(1);
  });

  it('アームが1つだけのとき常にそのアームを返す', () => {
    expect(assignVariant('user-abc', ['solo'] as const, { solo: 1 })).toBe('solo');
  });
});
