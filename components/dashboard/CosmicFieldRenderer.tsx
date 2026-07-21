import type { BadgeId } from '@/constants/badges/BadgeId';
import {
  getCosmicFieldConfig,
  motionModeToFloat,
} from '@/constants/cosmic/cosmicFieldConfig';
import { getCosmicTexture } from '@/constants/cosmic/cosmicTextureMap';
import { useTheme } from '@/hooks/useTheme';
import { hexToVec3 } from '@/lib/color/hexToVec3';
import { skiaCosmicInit } from '@/lib/dashboard/skiaCosmicInit';

import React, { useMemo } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { OrbGradientFallback } from './OrbGradientFallback';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useImage: (source: any) => any = () => null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const skia = require('@shopify/react-native-skia');
  useImage = skia.useImage;
} catch {
  // Skia not available — useImage always returns null → SVG fallback
}

const { SkiaCanvas, SkiaFill, SkiaShader, SkiaImageShader, runtimeEffect } =
  skiaCosmicInit();

// dev ビルドでシェーダーのコンパイルに失敗したら無言の劣化を防ぐため警告する。
if (__DEV__ && !runtimeEffect && SkiaCanvas) {
  console.warn('[CosmicFieldRenderer] COSMIC_FIELD_SHADER のコンパイルに失敗しました。SVG フォールバックで描画します。');
}

// ライトモードでも実写を出す。輝度キーで黒い夜空を透過するため、明るい背景でも
// 「黒い四角」にはならず光る雲として成立する。撤退時はこのフラグを false にする。
export const COSMIC_LIGHT_MODE_ENABLED = true;

interface CosmicFieldRendererProps {
  badgeId: BadgeId;
  size: number;
  time: SharedValue<number>;
  glowBoost?: SharedValue<number>;
  /** ティント元。BADGE_DEFINITIONS.colors.glow の hex */
  glowColor: string;
  /** Fallback gradient 用の 3 色 [core, mid, outer] */
  orbColors: readonly [string, string, string];
  testID?: string;
}

/**
 * ESA/Webb・ESA/Hubble の deep-sky 実写を「発光する雲」として描く汎用レンダラ。
 * 惑星の球面マッピング (PlanetOrbRenderer) と対をなす経路。
 * Skia or テクスチャ非対応時は SVG RadialGradient（orbColors）にフォールバック。
 */
export function CosmicFieldRenderer({
  badgeId,
  size,
  time,
  glowBoost,
  glowColor,
  orbColors,
  testID,
}: CosmicFieldRendererProps) {
  const { isDark } = useTheme();

  const cosmicImage = useImage(getCosmicTexture(badgeId));
  const config = getCosmicFieldConfig(badgeId);
  const tint = useMemo(() => hexToVec3(glowColor), [glowColor]);

  const motionMode = motionModeToFloat(config.motionMode);
  // sphere モードは経度スクロールで継ぎ目をまたぐため repeat が必要。
  const tx = config.motionMode === 'sphere' ? 'repeat' : 'clamp';

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [size, size],
    glowBoost: glowBoost?.value ?? 0,
    tintColor: [tint[0], tint[1], tint[2]],
    tintStrength: config.tintStrength,
    driftSpeed: config.driftSpeed,
    rotationSpeed: config.rotationSpeed,
    zoom: config.zoom,
    coreBrightness: config.coreBrightness,
    edgeSoftness: config.edgeSoftness,
    motionMode,
    tilt: config.tilt,
    zoomRate: config.zoomRate,
    zoomMax: config.zoomMax,
    parallaxStrength: config.parallaxStrength,
    swaySpeed: config.swaySpeed,
  }));

  const canUseSkia =
    (isDark || COSMIC_LIGHT_MODE_ENABLED) &&
    runtimeEffect &&
    SkiaCanvas &&
    SkiaFill &&
    SkiaShader &&
    SkiaImageShader &&
    cosmicImage;

  if (canUseSkia) {
    return (
      <SkiaCanvas
        style={{ width: size, height: size }}
        testID={testID ?? 'cosmic-field-canvas'}
      >
        <SkiaFill>
          <SkiaShader source={runtimeEffect} uniforms={uniforms}>
            <SkiaImageShader
              image={cosmicImage}
              tx={tx}
              ty="clamp"
              fit="fill"
              rect={{ x: 0, y: 0, width: size, height: size }}
            />
          </SkiaShader>
        </SkiaFill>
      </SkiaCanvas>
    );
  }

  return (
    <OrbGradientFallback
      size={size}
      colors={orbColors}
      testID={testID ?? 'cosmic-field-fallback'}
    />
  );
}
