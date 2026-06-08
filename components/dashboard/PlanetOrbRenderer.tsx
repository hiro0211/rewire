import type { BadgeId } from '@/constants/badges/BadgeId';
import { getPlanetShaderConfig } from '@/constants/planets/planetShaderConfig';
import { getPlanetTexture } from '@/constants/planets/planetTextureMap';
import { useTheme } from '@/hooks/useTheme';
import { skiaPlanetInit } from '@/lib/dashboard/skiaPlanetInit';

import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

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
  const stableId = useRef(Math.random().toString(36).slice(2, 8)).current;
  const fallbackGradId = `planet-fallback-grad-${stableId}`;

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

  const [c1, c2, c3] = orbColors;

  return (
    <View
      testID={testID ?? 'planet-orb-fallback'}
      style={[styles.fallbackOrb, { width: size, height: size }]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id={fallbackGradId}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
          >
            <Stop offset="0" stopColor={c1} stopOpacity="1" />
            <Stop offset="0.4" stopColor={c2} stopOpacity="1" />
            <Stop offset="0.75" stopColor={c3} stopOpacity="0.8" />
            <Stop offset="0.95" stopColor={c3} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill={`url(#${fallbackGradId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackOrb: {
    overflow: 'hidden',
  },
});
