import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { hexToVec3 } from '@/lib/color/hexToVec3';
import { skiaOrbInit } from '@/lib/dashboard/skiaOrbInit';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const { SkiaCanvas, SkiaFill, SkiaShader, runtimeEffect } = skiaOrbInit();

interface StaticOrbProps {
  colors: BadgeColorTriad;
  size: number;
}

/**
 * 静止版オーブ。AnimatedOrb の Skia shader を time=1.2 で固定描画し、
 * radial beam の面影を保ったまま pulse / glow / particle を省略する。
 * locked / inactive の視認性改善用。
 */
export function StaticOrb({ colors, size }: StaticOrbProps) {
  const { isDark } = useTheme();

  // time=1.2 は shader の beam パターンが最も顕著なフェーズ
  // （AnimatedOrb の初期値と視覚的に揃えるため）
  const time = useSharedValue(1.2);

  const [r1, g1, b1] = hexToVec3(colors.core);
  const [r2, g2, b2] = hexToVec3(colors.glow);
  const [r3, g3, b3] = hexToVec3(colors.accent);

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [size, size],
    color1: [r1, g1, b1],
    color2: [r2, g2, b2],
    color3: [r3, g3, b3],
  }));

  const useSkia = isDark && runtimeEffect && SkiaCanvas && SkiaFill && SkiaShader;

  return (
    <View
      testID="static-orb"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {useSkia ? (
        <SkiaCanvas style={{ width: size, height: size }} testID="static-orb-canvas">
          <SkiaFill>
            <SkiaShader source={runtimeEffect} uniforms={uniforms} />
          </SkiaFill>
        </SkiaCanvas>
      ) : (
        <LinearGradient
          testID="static-orb-fallback"
          colors={[colors.glow, colors.core, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    overflow: 'hidden',
  },
});
