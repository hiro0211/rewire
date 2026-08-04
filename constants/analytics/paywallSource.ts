/**
 * ペイウォール導線（source）の語彙。
 *
 * `paywall_viewed` / `paywall_dismissed` / `pro_purchase_completed` の3イベントが
 * 同じ語彙を共有することで、BigQuery 上で「表示 → 離脱 / 購入」を source 単位に
 * 結合できる。以前は viewed 側が `onboarding | returning`、dismissed 側が
 * `onboarding | direct` と別語彙を使っており、同じ導線が2つの名前に割れていた。
 *
 * ⚠️ 値を増やすときは docs/analytics/event-schema.md にも切替日を記録すること。
 *    過去データは遡って書き換わらないため、集計側で新旧の対応が必要になる。
 */
export const PAYWALL_SOURCE = {
  /** オンボーディング完走後のベネフィット画面から */
  ONBOARDING: 'onboarding',
  /** 既存ユーザーの起動時（app/brand.tsx）から */
  RETURNING: 'returning',
  /** 導線を特定できなかった場合 */
  UNKNOWN: 'unknown',
} as const;

export type PaywallSource = (typeof PAYWALL_SOURCE)[keyof typeof PAYWALL_SOURCE];

export const PAYWALL_SOURCES: readonly PaywallSource[] = [
  PAYWALL_SOURCE.ONBOARDING,
  PAYWALL_SOURCE.RETURNING,
  PAYWALL_SOURCE.UNKNOWN,
];

/**
 * ルートパラメータの生値を語彙に丸める。
 *
 * `useLocalSearchParams` は同名パラメータが複数あると配列を返すため先頭を採用し、
 * 語彙にない値は `unknown` に寄せる。丸めずに素通しすると、タイポや将来の
 * 実装漏れがそのまま新しい source 値として BigQuery に増え、導線の分母が割れる。
 */
export function toPaywallSource(raw: string | string[] | undefined): PaywallSource {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return PAYWALL_SOURCES.includes(value as PaywallSource)
    ? (value as PaywallSource)
    : PAYWALL_SOURCE.UNKNOWN;
}
