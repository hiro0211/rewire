import type { BadgeId } from '@/constants/badges/BadgeId';
import { getPlanetShaderConfig } from '@/constants/planets/planetShaderConfig';
import { getPlanetTexture } from '@/constants/planets/planetTextureMap';
import { useTheme } from '@/hooks/useTheme';
import { skiaPlanetInit } from '@/lib/dashboard/skiaPlanetInit';

import React from 'react';
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
  skiaPlanetInit();

interface PlanetOrbRendererProps {
  badgeId: BadgeId;
  size: number;
  time: SharedValue<number>;
  glowBoost?: SharedValue<number>;
  /** Fallback gradient 用の 3 色 [core, mid, outer] */
  orbColors: readonly [string, string, string];
  testID?: string;
}

/**
 * NASA 由来テクスチャを Skia の SkSL シェーダで球面マッピングする汎用惑星レンダラ。
 * Skia or テクスチャ非対応時は SVG RadialGradient（orbColors）にフォールバック。
 */
export function PlanetOrbRenderer({
  badgeId,
  size,
  time,
  glowBoost,
  orbColors,
  testID,
}: PlanetOrbRendererProps) {
  const { isDark } = useTheme();

  const planetImage = useImage(getPlanetTexture(badgeId));
  const config = getPlanetShaderConfig(badgeId);

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [size, size],
    glowBoost: glowBoost?.value ?? 0,
    cloudOpacity: config.cloudOpacity,
    atmosphereColor: [
      config.atmosphereColor[0],
      config.atmosphereColor[1],
      config.atmosphereColor[2],
    ],
    emissive: config.emissive,
    rotationSpeed: config.rotationSpeed,
  }));

  const canUseSkia =
    isDark &&
    runtimeEffect &&
    SkiaCanvas &&
    SkiaFill &&
    SkiaShader &&
    SkiaImageShader &&
    planetImage;

  if (canUseSkia) {
    return (
      <SkiaCanvas
        style={{ width: size, height: size }}
        testID={testID ?? 'planet-orb-canvas'}
      >
        <SkiaFill>
          <SkiaShader source={runtimeEffect} uniforms={uniforms}>
            <SkiaImageShader
              image={planetImage}
              tx="repeat"
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
      testID={testID ?? 'planet-orb-fallback'}
    />
  );
}
