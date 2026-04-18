import { CoreOrbRenderer } from '@/components/dashboard/CoreOrbRenderer';
import { OrbGlowLayers } from '@/components/dashboard/OrbGlowLayers';
import { OrbParticles } from '@/components/dashboard/OrbParticles';
import type { ChapterId } from '@/constants/badges/BadgeChapter';
import { getBadgeAnimConfig } from '@/constants/badges/badgeAnimations';
import type { BadgeId } from '@/constants/badges/BadgeId';
import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';
import { getOrbConfig } from '@/constants/orbConfig';
import { useOrbBreathing } from '@/hooks/dashboard/useOrbBreathing';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface BadgeOrbProps {
  /** バッジ固有の3色（BADGE_DEFINITIONS[i].colors） */
  colors: BadgeColorTriad;
  /** Orb サイズ（デフォルト 80px） */
  size?: number;
  /** アンロック済みなら true → フル演出、false → 静止ゴースト */
  isUnlocked: boolean;
  /** pulseDuration / scaleMin / scaleMax を取得するチャプター */
  chapterId: ChapterId;
  /** バッジ固有アニメーション上書きを適用するバッジID（省略時はチャプターデフォルト） */
  badgeId?: BadgeId;
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
  badgeId,
}: BadgeOrbProps) {
  const chapterConfig = badgeId
    ? getBadgeAnimConfig(badgeId, chapterId)
    : getOrbConfig(chapterId);

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
    />
  );
}

interface UnlockedBadgeOrbProps {
  colors: [string, string, string];
  size: number;
  chapterConfig: ReturnType<typeof getOrbConfig>;
}

function UnlockedBadgeOrb({
  colors,
  size,
  chapterConfig,
}: UnlockedBadgeOrbProps) {
  const { time, pulseStyle } = useOrbBreathing(chapterConfig);

  const [c1, c2] = colors;

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
        <CoreOrbRenderer
          colors={colors}
          size={size}
          time={time}
          testID="badge-orb-canvas"
        />
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
