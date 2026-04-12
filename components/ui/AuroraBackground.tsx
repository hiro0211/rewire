import { AURORA_SHADER } from '@/constants/shaders/aurora';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { AppState, Dimensions, StyleSheet, View } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Expo Go cannot run native modules like Skia. Detect it early and skip entirely.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SkiaCanvas: React.ComponentType<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SkiaFill: React.ComponentType<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SkiaShader: React.ComponentType<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let runtimeEffect: any = null;

if (!isExpoGo) {
  try {
    const skia = require('@shopify/react-native-skia');
    SkiaCanvas = skia.Canvas;
    SkiaFill = skia.Fill;
    SkiaShader = skia.Shader;
    runtimeEffect = skia.Skia.RuntimeEffect.Make(AURORA_SHADER);
  } catch {
    // Skia native bridge not available — fallback to gradient bg
  }
}

// Aurora color palette from the shader for the gradient fallback
const FALLBACK_COLORS = ['#0D1117', '#16213E', '#2D1B69', '#4A2080'] as const;

interface AuroraBackgroundProps {
  children?: React.ReactNode;
}

/**
 * Full-screen animated aurora gradient using Skia RuntimeShader.
 * Shader runs entirely on GPU; JS thread only drives the time uniform.
 * Animation pauses automatically when the app is backgrounded.
 * Falls back to a static LinearGradient when Skia is unavailable (e.g. Expo Go).
 */
export function AuroraBackground({ children }: AuroraBackgroundProps) {
  const time = useSharedValue(0);
  const active = useSharedValue(true);

  useFrameCallback((info) => {
    if (active.value) {
      time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
    }
  });

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      active.value = state === 'active';
    });
    return () => sub.remove();
  }, [active]);

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
  }));

  // Fallback: aurora-style gradient when Skia is unavailable
  if (!runtimeEffect || !SkiaCanvas || !SkiaFill || !SkiaShader) {
    return (
      <View style={styles.container} testID="aurora-fallback">
        <LinearGradient
          colors={[...FALLBACK_COLORS]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="aurora-container">
      <SkiaCanvas style={StyleSheet.absoluteFill} testID="aurora-canvas">
        <SkiaFill>
          <SkiaShader source={runtimeEffect} uniforms={uniforms} />
        </SkiaFill>
      </SkiaCanvas>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
