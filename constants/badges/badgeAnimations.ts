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
  // ── Chapter 1: Chaos（混沌）─ 最もゆっくり、穏やかな呼吸
  Stardust:       undefined,                                          // チャプターデフォルト（4000ms）
  Nebula:         { pulseDuration: 3900 },                           // pulseDurationのみ部分上書き
  Protostar:      { pulseDuration: 3700, scaleMin: 0.95, scaleMax: 1.05 },

  // ── Chapter 2: Ignition（点火）─ 炎のように少し活発に
  Ignition:       { pulseDuration: 3600 },
  MainSequence:   { pulseDuration: 3400 },
  Radiance:       { pulseDuration: 3200, particleCount: 7 },

  // ── Chapter 3: Formation（形成）─ 重厚な回転感
  AccretionDisk:  { pulseDuration: 3100 },
  Planetesimal:   { pulseDuration: 2900 },
  PlanetaryBirth: { pulseDuration: 2800, scaleMin: 0.93, scaleMax: 1.07 },

  // ── Chapter 4: Life（生命）─ 鼓動するような呼吸
  HabitableWorld: { pulseDuration: 2700 },
  Biogenesis:     { pulseDuration: 2500 },
  Civilization:   { pulseDuration: 2400, particleCount: 9 },

  // ── Chapter 5: Expansion（拡張）─ 広がりを感じる速さ
  SolarSystem:    { pulseDuration: 2300 },
  BinaryStars:    { pulseDuration: 2000 },
  StarCluster:    { pulseDuration: 1900, particleCount: 10 },

  // ── Chapter 6: Transcendence（超越）─ 最速・最もダイナミック
  Galaxy:         { pulseDuration: 1750 },
  GalaxyCluster:  { pulseDuration: 1600 },
  Cosmos:         { pulseDuration: 1500 },                           // 最速（1500ms）
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
