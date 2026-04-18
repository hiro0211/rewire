import { useTheme } from '@/hooks/useTheme';
import { skiaEarthInit } from '@/lib/dashboard/skiaEarthInit';

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
  skiaEarthInit();

interface EarthOrbRendererProps {
  size: number;
  time: SharedValue<number>;
  glowBoost?: SharedValue<number>;
  /** フォールバック用の3色 [core, mid, outer] */
  orbColors: readonly [string, string, string];
  testID?: string;
}

/**
 * 地球バッジ専用のオーブレンダラー。
 * Skia + テクスチャ利用可能時: SkSLシェーダーで正距円筒図法テクスチャを球面マッピング
 * それ以外: SVG RadialGradient フォールバック（Earth青色）
 */
export function EarthOrbRenderer({
  size,
  time,
  glowBoost,
  orbColors,
  testID,
}: EarthOrbRendererProps) {
  const { isDark } = useTheme();
  const stableId = useRef(Math.random().toString(36).slice(2, 8)).current;
  const fallbackGradId = `earth-fallback-grad-${stableId}`;

  const earthImage = useImage(require('@/assets/images/earth-equirect.png'));

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [size, size],
    glowBoost: glowBoost?.value ?? 0,
  }));

  const canUseSkia =
    isDark &&
    runtimeEffect &&
    SkiaCanvas &&
    SkiaFill &&
    SkiaShader &&
    SkiaImageShader &&
    earthImage;

  // TODO: デバッグ用 — 問題特定後に削除
  if (__DEV__) {
    console.log('[EarthOrbRenderer] canUseSkia:', !!canUseSkia, {
      isDark,
      runtimeEffect: !!runtimeEffect,
      SkiaCanvas: !!SkiaCanvas,
      SkiaFill: !!SkiaFill,
      SkiaShader: !!SkiaShader,
      SkiaImageShader: !!SkiaImageShader,
      earthImage: !!earthImage,
    });
  }

  if (canUseSkia) {
    return (
      <SkiaCanvas
        style={{ width: size, height: size }}
        testID={testID ?? 'earth-orb-canvas'}
      >
        <SkiaFill>
          <SkiaShader source={runtimeEffect} uniforms={uniforms}>
            <SkiaImageShader
              image={earthImage}
              tx="repeat"
              ty="clamp"
              fit="fill"
            />
          </SkiaShader>
        </SkiaFill>
      </SkiaCanvas>
    );
  }

  const [c1, c2, c3] = orbColors;

  return (
    <View
      testID={testID ?? 'earth-orb-fallback'}
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
