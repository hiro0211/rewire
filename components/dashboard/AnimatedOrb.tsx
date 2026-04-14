import React, { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
  useFrameCallback,
} from 'react-native-reanimated';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { getOrbConfig } from '@/constants/orbConfig';
import { ORB_SHADER } from '@/constants/shaders/orb';
import type { GrowthStageName } from '@/constants/growthStages';

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

interface AnimatedOrbProps {
  tierName: GrowthStageName;
  size?: number;
}

export function AnimatedOrb({ tierName, size = 200 }: AnimatedOrbProps) {
  const { isDark, glow } = useTheme();
  const config = getOrbConfig(tierName);

  const time = useSharedValue(0);
  const active = useSharedValue(true);

  // Breathing pulse animation
  const scale = useSharedValue(config.scaleMin);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(config.scaleMax, {
        duration: config.pulseDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [config]);

  // Glow opacity pulse
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.7, {
        duration: config.pulseDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [config]);

  // AppState: pause on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      active.value = state === 'active';
    });
    return () => sub.remove();
  }, []);

  useFrameCallback((info) => {
    if (active.value) {
      time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
    }
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const [c1, c2, c3] = config.colors;
  // Pre-compute color vectors on JS thread (hexToVec3 cannot run in worklet)
  const [r1, g1, b1] = hexToVec3(c1);
  const [r2, g2, b2] = hexToVec3(c2);
  const [r3, g3, b3] = hexToVec3(c3);

  const uniforms = useDerivedValue(() => ({
    time: time.value,
    resolution: [size, size],
    color1: [r1, g1, b1],
    color2: [r2, g2, b2],
    color3: [r3, g3, b3],
  }));

  const useSkia = isDark && runtimeEffect && SkiaCanvas && SkiaFill && SkiaShader;

  return (
    <View testID="animated-orb" style={[styles.container, { width: size, height: size }]}>
      {/* Glow behind orb */}
      <Animated.View
        testID="orb-glow"
        style={[
          styles.glow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            backgroundColor: glow.cyan,
            left: -(size * 0.2),
            top: -(size * 0.2),
          },
          glowStyle,
        ]}
      />

      <Animated.View style={[{ width: size, height: size }, pulseStyle]}>
        {useSkia ? (
          <SkiaCanvas style={{ width: size, height: size }} testID="orb-canvas">
            <SkiaFill>
              <SkiaShader source={runtimeEffect} uniforms={uniforms} />
            </SkiaFill>
          </SkiaCanvas>
        ) : (
          // Fallback: circular LinearGradient with Reanimated pulse
          <View style={[styles.fallbackOrb, { width: size, height: size, borderRadius: size / 2 }]}>
            <LinearGradient
              colors={[...config.colors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  fallbackOrb: {
    overflow: 'hidden',
  },
});
