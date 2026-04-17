import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { hexToVec3 } from '@/lib/color/hexToVec3';
import { skiaOrbInit } from '@/lib/dashboard/skiaOrbInit';
import { useOrbBreathing } from '@/hooks/dashboard/useOrbBreathing';
import { getOrbConfig } from '@/constants/orbConfig';
import { OrbGlowLayers } from '@/components/dashboard/OrbGlowLayers';
import { OrbParticles } from '@/components/dashboard/OrbParticles';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';
import type { ChapterId } from '@/constants/badges/BadgeChapter';

const { SkiaCanvas, SkiaFill, SkiaShader, runtimeEffect } = skiaOrbInit();

interface BadgeOrbProps {
  /** バッジ固有の3色（BADGE_DEFINITIONS[i].colors） */
  colors: BadgeColorTriad;
  /** Orb サイズ（デフォルト 80px） */
  size?: number;
  /** アンロック済みなら true → フル演出、false → 静止ゴースト */
  isUnlocked: boolean;
  /** pulseDuration / scaleMin / scaleMax を取得するチャプター */
  chapterId: ChapterId;
}

/**
 * バッジ 1 個分の Orb。unlocked はパルス・発光・粒子、locked は薄暗い静止ゴースト。
 * AnimatedOrb と構造を揃えつつ、色は props.colors を正として描く。
 */
export function BadgeOrb({
  colors,
  size = 80,
  isUnlocked,
  chapterId,
}: BadgeOrbProps) {
  const { isDark } = useTheme();
  const chapterConfig = getOrbConfig(chapterId);

  const containerSize = size * 1.6;
  const offset = (containerSize - size) / 2;

  const tripleColors: [string, string, string] = [
    colors.core,
    colors.glow,
    colors.accent,
  ];

  if (!isUnlocked) {
    // Locked: 静止ゴースト（アニメ・Skia・パーティクルなし）
    return (
      <View
        testID="badge-orb-locked"
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            opacity: 0.3,
          },
        ]}
      >
        <View
          style={[
            styles.fallbackOrb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              position: 'absolute',
              left: offset,
              top: offset,
            },
          ]}
        >
          <LinearGradient
            testID="badge-orb-locked-gradient"
            colors={tripleColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    );
  }

  return (
    <UnlockedBadgeOrb
      colors={tripleColors}
      size={size}
      chapterConfig={chapterConfig}
      isDark={isDark}
    />
  );
}

interface UnlockedBadgeOrbProps {
  colors: [string, string, string];
  size: number;
  chapterConfig: ReturnType<typeof getOrbConfig>;
  isDark: boolean;
}

function UnlockedBadgeOrb({
  colors,
  size,
  chapterConfig,
  isDark,
}: UnlockedBadgeOrbProps) {
  const { time, pulseStyle } = useOrbBreathing(chapterConfig);

  const [c1, c2, c3] = colors;
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

  const containerSize = size * 1.6;
  const offset = (containerSize - size) / 2;

  // glow はバッジ固有の glow カラーをそのまま使う
  const glowColor = c2;

  return (
    <View
      testID="badge-orb-unlocked"
      style={[
        styles.container,
        { width: containerSize, height: containerSize },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
      >
        <OrbGlowLayers
          size={size}
          glowColor={glowColor}
          pulseDuration={chapterConfig.pulseDuration}
        />
      </View>

      <View
        pointerEvents="none"
        style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
      >
        <OrbParticles size={size} count={chapterConfig.particleCount} tintColor={c1} />
      </View>

      <Animated.View
        style={[
          { width: size, height: size, position: 'absolute', left: offset, top: offset },
          pulseStyle,
        ]}
      >
        {useSkia ? (
          <SkiaCanvas style={{ width: size, height: size }} testID="badge-orb-canvas">
            <SkiaFill>
              <SkiaShader source={runtimeEffect} uniforms={uniforms} />
            </SkiaFill>
          </SkiaCanvas>
        ) : (
          <View
            style={[styles.fallbackOrb, { width: size, height: size, borderRadius: size / 2 }]}
          >
            <LinearGradient
              colors={colors}
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
  overlay: {
    position: 'absolute',
  },
  fallbackOrb: {
    overflow: 'hidden',
  },
});
