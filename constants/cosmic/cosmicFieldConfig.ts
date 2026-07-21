import type { BadgeId } from '@/constants/badges/BadgeId';
import type { CosmicBadgeId } from '@/constants/cosmic/cosmicTextureMap';

/**
 * 宇宙フィールドシェーダーの立体モーション種別。
 *   parallax   — 明るさを奥行きに見立てた 2.5D 視差（星雲・原始星）
 *   disk       — 傾けた円盤として自転（銀河・同心リング）
 *   sphere     — 球面マッピングで回転（星団・星野・惑星状星雲）
 *   flythrough — 回転せず進むズーム＋視差（ディープフィールド）
 */
export type CosmicMotionMode = 'parallax' | 'disk' | 'sphere' | 'flythrough';

/**
 * 宇宙フィールドシェーダーのバッジ別チューニング。
 * 色（tint）は含めない — BADGE_DEFINITIONS.colors.glow を単一情報源とし、
 * CosmicFieldRenderer 側で hexToVec3 して uniform に渡す。
 */
export interface CosmicFieldConfig {
  /** 立体モーション種別 */
  motionMode: CosmicMotionMode;
  /** 中心クロップ倍率（>1 で寄る） */
  zoom: number;
  /** 回転 rad/s。disk=自転 / sphere=経度スクロール速度 */
  rotationSpeed: number;
  /** ゆるいドリフト速度 */
  driftSpeed: number;
  /** 中心コアの明るさ 0-1 */
  coreBrightness: number;
  /** ソフト放射状マスクの減衰幅 0-1 */
  edgeSoftness: number;
  /** glow 色でのティント混合率 0-1 */
  tintStrength: number;
  /** disk: 円盤の傾き（rad, 0〜π/2） */
  tilt: number;
  /** flythrough: ズームの ping-pong 速度 */
  zoomRate: number;
  /** flythrough: 最大ズーム倍率（>=1） */
  zoomMax: number;
  /** parallax: サンプリングずらし強度 0-1 */
  parallaxStrength: number;
  /** parallax: 視点スウェイ速度 */
  swaySpeed: number;
}

export const DEFAULT_COSMIC_FIELD_CONFIG: CosmicFieldConfig = {
  motionMode: 'parallax',
  zoom: 1.5,
  rotationSpeed: 0.08,
  driftSpeed: 0.05,
  coreBrightness: 0.35,
  edgeSoftness: 0.5,
  tintStrength: 0.35,
  tilt: 0.6,
  zoomRate: 0.05,
  zoomMax: 1.5,
  parallaxStrength: 0.12,
  swaySpeed: 0.15,
};

export const COSMIC_FIELD_CONFIG: Record<CosmicBadgeId, CosmicFieldConfig> = {
  // Day 0 — Sagittarius Star Cloud。密な星野 → 回る星の球体。
  stardust: { motionMode: 'sphere', zoom: 1.4, rotationSpeed: 0.06, driftSpeed: 0.06, coreBrightness: 0.3, edgeSoftness: 0.6, tintStrength: 0.45, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.12, swaySpeed: 0.15 },
  // Day 1 — Cosmic Cliffs。崖状の雲 → 視差で立体化。
  nebula: { motionMode: 'parallax', zoom: 1.5, rotationSpeed: 0.02, driftSpeed: 0.05, coreBrightness: 0.35, edgeSoftness: 0.5, tintStrength: 0.35, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.14, swaySpeed: 0.16 },
  // Day 3 — Protostar L1527。砂時計＋中心星 → 視差で立体化。
  protostar: { motionMode: 'parallax', zoom: 1.6, rotationSpeed: 0.02, driftSpeed: 0.04, coreBrightness: 0.7, edgeSoftness: 0.45, tintStrength: 0.3, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.1, swaySpeed: 0.12 },
  // 365 — Southern Ring Nebula。丸い惑星状星雲 → 光る殻が回転。
  whiteDwarf: { motionMode: 'sphere', zoom: 1.4, rotationSpeed: 0.07, driftSpeed: 0.03, coreBrightness: 0.8, edgeSoftness: 0.4, tintStrength: 0.25, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.12, swaySpeed: 0.15 },
  // 500 — Wolf-Rayet 140 の同心リング → 傾いた円盤が回転。
  stellarSystem: { motionMode: 'disk', zoom: 1.3, rotationSpeed: 0.12, driftSpeed: 0.03, coreBrightness: 0.45, edgeSoftness: 0.42, tintStrength: 0.3, tilt: 0.7, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.12, swaySpeed: 0.15 },
  // 730 — Westerlund 2。密な星団 → 回る星の球体。
  starCluster: { motionMode: 'sphere', zoom: 1.6, rotationSpeed: 0.08, driftSpeed: 0.05, coreBrightness: 0.4, edgeSoftness: 0.5, tintStrength: 0.35, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.12, swaySpeed: 0.15 },
  // 1000 — Phantom Galaxy M74。正面渦巻 → 傾けた円盤として自転。
  galaxy: { motionMode: 'disk', zoom: 1.15, rotationSpeed: 0.15, driftSpeed: 0.02, coreBrightness: 0.35, edgeSoftness: 0.38, tintStrength: 0.3, tilt: 0.62, zoomRate: 0.05, zoomMax: 1.5, parallaxStrength: 0.12, swaySpeed: 0.15 },
  // 1095 — Webb's First Deep Field → 宇宙を進むズーム＋視差。
  cosmos: { motionMode: 'flythrough', zoom: 1.1, rotationSpeed: 0.01, driftSpeed: 0.02, coreBrightness: 0.2, edgeSoftness: 0.35, tintStrength: 0.2, tilt: 0.6, zoomRate: 0.05, zoomMax: 1.7, parallaxStrength: 0.08, swaySpeed: 0.1 },
};

export function getCosmicFieldConfig(
  badgeId: BadgeId | undefined,
): CosmicFieldConfig {
  if (!badgeId) return DEFAULT_COSMIC_FIELD_CONFIG;
  const cfg = (COSMIC_FIELD_CONFIG as Record<string, CosmicFieldConfig>)[
    badgeId
  ];
  return cfg ?? DEFAULT_COSMIC_FIELD_CONFIG;
}

const MOTION_MODE_CODE: Record<CosmicMotionMode, number> = {
  parallax: 0,
  disk: 1,
  sphere: 2,
  flythrough: 3,
};

/** シェーダー uniform 用に motionMode を float に変換する。 */
export function motionModeToFloat(mode: CosmicMotionMode): number {
  return MOTION_MODE_CODE[mode];
}
