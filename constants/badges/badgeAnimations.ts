import type { ChapterId } from './BadgeChapter';
import type { BadgeId } from './BadgeId';
import { getOrbConfig, type OrbTierConfig } from '@/constants/orbConfig';

/** バッジ固有のアニメーション上書き値（undefined = チャプターデフォルトをそのまま使用） */
export type BadgeAnimationOverride = Partial<OrbTierConfig>;

/**
 * バッジIDごとのアニメーション上書き値マップ。
 * undefined のバッジはチャプターデフォルト設定にフォールバックする。
 * 値が設定されている場合も Partial のため未指定フィールドはフォールバック。
 */
export const BADGE_ANIMATION_OVERRIDES: Record<BadgeId, BadgeAnimationOverride | undefined> = {
  // ── Chapter 1: Birth（誕生）─ 最もゆっくり、穏やかな呼吸
  stardust:       undefined,                                          // チャプターデフォルト（4000ms）
  nebula:         { pulseDuration: 3900 },                           // pulseDurationのみ部分上書き
  protostar:      { pulseDuration: 3700, scaleMin: 0.95, scaleMax: 1.05 },

  // ── Chapter 2: Inner Planets（内惑星）─ 少し活発に
  moon:           { pulseDuration: 3600 },
  mercury:        { pulseDuration: 3400 },
  venus:          { pulseDuration: 3200, particleCount: 7 },

  // ── Chapter 3: Terrestrial（地球型惑星）─ 重厚な回転感
  earth:          { pulseDuration: 3100 },
  mars:           { pulseDuration: 2900 },
  jupiter:        { pulseDuration: 2800, scaleMin: 0.93, scaleMax: 1.07 },

  // ── Chapter 4: Outer Planets（外惑星）─ 鼓動するような呼吸
  saturn:         { pulseDuration: 2700 },
  uranus:         { pulseDuration: 2500 },
  neptune:        { pulseDuration: 2400, particleCount: 9 },

  // ── Chapter 5: Stellar（恒星）─ 広がりを感じる速さ
  sun:            { pulseDuration: 2300 },
  whiteDwarf:     { pulseDuration: 2000 },
  stellarSystem:  { pulseDuration: 1900, particleCount: 10 },

  // ── Chapter 6: Cosmic（宇宙）─ 最速・最もダイナミック
  starCluster:    { pulseDuration: 1750 },
  galaxy:         { pulseDuration: 1600 },
  cosmos:         { pulseDuration: 1500 },                           // 最速（1500ms）
};

/**
 * バッジ固有のアニメーション設定を返す。
 * チャプターのデフォルト設定にバッジ固有の上書き値をスプレッドしてマージする。
 */
export function getBadgeAnimConfig(
  badgeId: BadgeId,
  chapterId: ChapterId
): OrbTierConfig {
  const chapterConfig = getOrbConfig(chapterId);
  const override = BADGE_ANIMATION_OVERRIDES[badgeId];
  if (!override) return chapterConfig;
  return { ...chapterConfig, ...override };
}
