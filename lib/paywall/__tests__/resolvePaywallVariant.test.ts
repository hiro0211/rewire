import {
  PAYWALL_VARIANTS,
  PAYWALL_VARIANT_WEIGHTS,
  isPaywallVariant,
} from '@/constants/paywall/paywallExperiment';
import { assignVariant } from '@/lib/experiment/assignVariant';
import { resolvePaywallVariant } from '../resolvePaywallVariant';

/** 固定シードのLCGで擬似UUIDを生成し、失敗時に同じ入力で再現できるようにする */
function makeUuidLikeIds(count: number): string[] {
  let state = 0x5bf03635;
  const nextWord = (): string => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state.toString(16).padStart(8, '0');
  };

  return Array.from({ length: count }, () => {
    const a = nextWord();
    const b = nextWord();
    const c = nextWord();
    const d = nextWord();
    return `${a}-${b.slice(0, 4)}-${b.slice(4)}-${c.slice(0, 4)}-${c.slice(4)}${d}`;
  });
}

describe('resolvePaywallVariant', () => {
  it('userIdがnullのときdefaultを返す', () => {
    expect(resolvePaywallVariant(null)).toBe('default');
  });

  it('userIdがundefinedのときdefaultを返す', () => {
    expect(resolvePaywallVariant(undefined)).toBe('default');
  });

  it('userIdが空文字のときdefaultを返す', () => {
    expect(resolvePaywallVariant('')).toBe('default');
  });

  it('同じuserIdのとき常に同じバリアントを返す', () => {
    const userId = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

    expect(resolvePaywallVariant(userId)).toBe(resolvePaywallVariant(userId));
  });

  it('返り値が必ず語彙内のバリアントになる', () => {
    const results = makeUuidLikeIds(200).map((id) => resolvePaywallVariant(id));

    expect(results.every(isPaywallVariant)).toBe(true);
  });

  it('多数のuserIdを流すと両アームに45〜55%ずつ割り当てられる', () => {
    const ids = makeUuidLikeIds(2000);

    const defaults = ids.filter((id) => resolvePaywallVariant(id) === 'default').length;
    const share = defaults / ids.length;

    expect(share).toBeGreaterThan(0.45);
    expect(share).toBeLessThan(0.55);
  });

  /**
   * 実験IDをソルトに混ぜる効果の検証。「違う値になる」だけを見るテストは
   * 全反転（100%不一致）も通してしまうので、一致率で独立性を見る。
   *
   * 注意: このテストは fmix32 の有無を検出できない（実測で確認済み）。
   * assignVariant はハッシュの上位ビット（`hash / 2^32`）を使い、素の FNV-1a でも
   * 上位ビットは撹拌されているため、ここは fmix32 を外しても 50.4% で通る。
   * 線形パリティ（下位ビット）の担保は lib/experiment/__tests__/stableHash.test.ts
   * のアバランチ検証が担っている。あちらを消すと防御がゼロになる。
   */
  it('実験IDが違うと一致率が40〜60%になり独立に割り当てられる', () => {
    const ids = makeUuidLikeIds(2000);

    const matches = ids.filter(
      (id) =>
        resolvePaywallVariant(id) ===
        assignVariant(`paywall_next_experiment:${id}`, PAYWALL_VARIANTS, PAYWALL_VARIANT_WEIGHTS)
    ).length;
    const matchRate = matches / ids.length;

    expect(matchRate).toBeGreaterThan(0.4);
    expect(matchRate).toBeLessThan(0.6);
  });
});
