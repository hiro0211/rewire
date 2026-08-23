/**
 * ペイウォール A/B 実験の定義。
 *
 * 割当は `user.id` の決定論的ハッシュで決まる（lib/paywall/resolvePaywallVariant.ts）。
 * AsyncStorage も Zustand も挟まないので、非同期読み込みを待つ必要がなく
 * 「バリアント確定前のチラつき」が原理的に起きない。
 *
 * ⚠️ 重みやアーム構成を変えたくなったら、この実験IDは触らず新しい実験IDを起こすこと。
 *    同じIDのまま重みを変えると、既存ユーザーの割当が入れ替わって
 *    BigQuery 上で前後のデータが同じ実験名に混ざり、比較が成立しなくなる。
 * ⚠️ アームを増やすときは docs/analytics/event-schema.md にも切替日を記録すること。
 */

/** 実験ID。ハッシュのソルトを兼ねる（実験ごとに割当を独立させるため） */
export const PAYWALL_EXPERIMENT_ID = 'paywall_cosmic_journey_2026_08';

export const PAYWALL_VARIANTS = ['default', 'cosmicJourney'] as const;

export type PaywallVariant = (typeof PAYWALL_VARIANTS)[number];

/** アームごとの相対重み。両方 1 で 50/50 */
export const PAYWALL_VARIANT_WEIGHTS: Readonly<Record<PaywallVariant, number>> = {
  default: 1,
  cosmicJourney: 1,
};

/** user.id を取得できないときの既定。実験前の挙動に倒して被害を出さない */
export const PAYWALL_VARIANT_FALLBACK: PaywallVariant = 'default';

/** 外部から来た生値（保存値・パラメータ）を語彙に照合する */
export function isPaywallVariant(value: unknown): value is PaywallVariant {
  return PAYWALL_VARIANTS.includes(value as PaywallVariant);
}
