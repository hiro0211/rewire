import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface OrbGradientFallbackProps {
  size: number;
  /** [core, mid, outer] */
  colors: readonly [string, string, string];
  testID?: string;
}

/**
 * Skia / テクスチャ非対応時（ExpoGo・ライトモード・読込中）の
 * SVG RadialGradient フォールバック。惑星・宇宙フィールド両レンダラで共有する。
 */
export function OrbGradientFallback({
  size,
  colors,
  testID,
}: OrbGradientFallbackProps) {
  const stableId = useRef(Math.random().toString(36).slice(2, 8)).current;
  const gradId = `orb-fallback-grad-${stableId}`;
  const [c1, c2, c3] = colors;

  return (
    <View
      testID={testID ?? 'orb-gradient-fallback'}
      style={[styles.fallbackOrb, { width: size, height: size }]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={c1} stopOpacity="1" />
            <Stop offset="0.4" stopColor={c2} stopOpacity="1" />
            <Stop offset="0.75" stopColor={c3} stopOpacity="0.8" />
            <Stop offset="0.95" stopColor={c3} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackOrb: {
    overflow: 'hidden',
  },
});
