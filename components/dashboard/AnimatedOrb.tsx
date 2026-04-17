import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { getOrbConfig } from '@/constants/orbConfig';
import { hexToVec3 } from '@/lib/color/hexToVec3';
import { skiaOrbInit } from '@/lib/dashboard/skiaOrbInit';
import { useOrbBreathing } from '@/hooks/dashboard/useOrbBreathing';
import { useOrbTapAnimation } from '@/hooks/dashboard/useOrbTapAnimation';
import { OrbSoftAura } from './OrbSoftAura';
import { OrbScatteredStars } from './OrbScatteredStars';
import { OrbGlowLayers } from './OrbGlowLayers';
import { OrbParticles } from './OrbParticles';
import { OrbTapRipple } from './OrbTapRipple';
import type { ChapterId } from '@/constants/badges/BadgeChapter';

const { SkiaCanvas, SkiaFill, SkiaShader, runtimeEffect } = skiaOrbInit();

interface AnimatedOrbProps {
  chapterId: ChapterId;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function AnimatedOrb({ chapterId, size = 200, onPress, onLongPress }: AnimatedOrbProps) {
  const { isDark } = useTheme();
  const config = getOrbConfig(chapterId);

  const { time, breathingScale } = useOrbBreathing(config);
  const { tapScale, glowIntensity, rippleTrigger, handlePressIn, handlePressOut } =
    useOrbTapAnimation();

  // Compose breathing + tap scale
  const finalScale = useDerivedValue(() => breathingScale.value * tapScale.value);
  const pulseStyle = useDerivedValue(() => ({
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
        {/* Large soft halo behind the orb */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: containerSize, height: containerSize }]}
        >
          <OrbSoftAura size={size} glowColor={config.glowColor} />
        </View>

        {/* Scattered star particles */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: containerSize, height: containerSize }]}
        >
          <OrbScatteredStars size={size} />
        </View>

        {/* Multi-layer glow + pulse ring behind orb */}
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <OrbGlowLayers
            size={size}
            glowColor={config.glowColor}
            pulseDuration={config.pulseDuration}
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
