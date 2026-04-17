import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { ORB_SHADER } from '@/constants/shaders/orb';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

let SkiaCanvas: React.ComponentType<any> | null = null;
let SkiaFill: React.ComponentType<any> | null = null;
let SkiaShader: React.ComponentType<any> | null = null;
let runtimeEffect: any = null;

if (!isExpoGo) {
  try {
    const skia = require('@shopify/react-native-skia');
    SkiaCanvas = skia.Canvas;
    SkiaFill = skia.Fill;
    SkiaShader = skia.Shader;
    runtimeEffect = skia.Skia.RuntimeEffect.Make(ORB_SHADER);
  } catch {
    // Skia native bridge not available
  }
}

function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

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
