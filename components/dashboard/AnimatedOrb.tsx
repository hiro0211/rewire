import React, { useEffect } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
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
import { useOrbTapAnimation } from '@/hooks/dashboard/useOrbTapAnimation';
import { OrbGlowLayers } from './OrbGlowLayers';
import { OrbParticles } from './OrbParticles';
import { OrbTapRipple } from './OrbTapRipple';
import type { ChapterId } from '@/constants/badges/BadgeChapter';

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
  chapterId: ChapterId;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function AnimatedOrb({ chapterId, size = 200, onPress, onLongPress }: AnimatedOrbProps) {
  const { isDark } = useTheme();
  const config = getOrbConfig(chapterId);

  const time = useSharedValue(0);
  const active = useSharedValue(true);

  // Tap animation hook
  const { tapScale, glowIntensity, rippleTrigger, handlePressIn, handlePressOut } =
    useOrbTapAnimation();

  // Breathing pulse animation
  const breathingScale = useSharedValue(config.scaleMin);
  useEffect(() => {
    breathingScale.value = withRepeat(
      withTiming(config.scaleMax, {
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

  // Compose breathing + tap scale
  const finalScale = useDerivedValue(() => breathingScale.value * tapScale.value);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: finalScale.value }],
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
    glowBoost: glowIntensity.value,
  }));

  const useSkia = isDark && runtimeEffect && SkiaCanvas && SkiaFill && SkiaShader;

  // Container expanded to accommodate glow + particles (size * 2.0)
  const containerSize = size * 2.0;
  const offset = (containerSize - size) / 2;

  return (
    <Pressable
      testID="orb-pressable"
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayPressIn={50}
    >
      <View
        testID="animated-orb"
        style={[styles.container, { width: containerSize, height: containerSize }]}
      >
        {/* Multi-layer glow + pulse ring behind orb */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <OrbGlowLayers
            size={size}
            glowColor={config.glowColor}
            pulseDuration={config.pulseDuration}
            glowIntensity={glowIntensity}
          />
        </View>

        {/* Orbiting particles */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <OrbParticles size={size} count={config.particleCount} tintColor={c1} />
        </View>

        {/* Core orb with breathing + tap scale */}
        <Animated.View
          style={[
            { width: size, height: size, position: 'absolute', left: offset, top: offset },
            pulseStyle,
          ]}
        >
          {useSkia ? (
            <SkiaCanvas style={{ width: size, height: size }} testID="orb-canvas">
              <SkiaFill>
                <SkiaShader source={runtimeEffect} uniforms={uniforms} />
              </SkiaFill>
            </SkiaCanvas>
          ) : (
            // Fallback: circular LinearGradient with Reanimated pulse
            <View
              style={[styles.fallbackOrb, { width: size, height: size, borderRadius: size / 2 }]}
            >
              <LinearGradient
                colors={[...config.colors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        </Animated.View>

        {/* Tap ripple ring */}
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            styles.centered,
            { width: containerSize, height: containerSize },
          ]}
        >
          <OrbTapRipple size={size} color={c1} trigger={rippleTrigger} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackOrb: {
    overflow: 'hidden',
  },
});
