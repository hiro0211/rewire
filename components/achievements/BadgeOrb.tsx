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
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Ellipse, Svg } from 'react-native-svg';

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
 * 特殊描画:
 *   SolarSystem  → SaturnRing（土星の環）
 *   BinaryStars  → StellarSystemOverlay（恒星系の軌道）
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

  const showSaturnRing = badgeId === 'SolarSystem';
  const showStellarOverlay = badgeId === 'BinaryStars';

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
        {showSaturnRing && (
          <SaturnRing size={size} color={colors.glow} containerSize={containerSize} />
        )}
      </View>
    );
  }

  return (
    <UnlockedBadgeOrb
      colors={tripleColors}
      glowColor={colors.glow}
      size={size}
      chapterConfig={chapterConfig}
      showSaturnRing={showSaturnRing}
      showStellarOverlay={showStellarOverlay}
    />
  );
}

// ── SaturnRing ─────────────────────────────────────────────────────────────

interface SaturnRingProps {
  size: number;
  color: string;
  containerSize: number;
}

/**
 * 土星の環を模した楕円オーバーレイ。SolarSystem バッジ専用。
 * orb の手前レイヤーに配置し、-20° 傾けることで奥行き感を演出する。
 */
function SaturnRing({ size, color, containerSize }: SaturnRingProps) {
  const ringW = size * 1.45;
  const ringH = size * 0.32;
  const cx = ringW / 2;
  const cy = ringH / 2;

  return (
    <View
      testID="saturn-ring"
      pointerEvents="none"
      style={[
        styles.saturnRingContainer,
        {
          width: ringW,
          height: ringH,
          top: (containerSize - ringH) / 2,
          left: (containerSize - ringW) / 2,
        },
      ]}
    >
      <Svg width={ringW} height={ringH}>
        {/* 後ろ半楕円（下側）— zOrder の都合上こちらを先に描く */}
        <Ellipse
          cx={cx}
          cy={cy}
          rx={cx - 2}
          ry={cy - 1}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={0.45}
          rotation={-20}
          originX={cx}
          originY={cy}
        />
        {/* 前半楕円（上側）— より不透明にして立体感を出す */}
        <Ellipse
          cx={cx}
          cy={cy}
          rx={cx - 2}
          ry={cy - 1}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          opacity={0.7}
          rotation={-20}
          originX={cx}
          originY={cy}
          strokeDasharray={`${Math.PI * (cx - 2)} ${Math.PI * (cx - 2)}`}
          strokeDashoffset={Math.PI * (cx - 2) * 0.5}
        />
      </Svg>
    </View>
  );
}

// ── StellarSystemOverlay ───────────────────────────────────────────────────

/**
 * 軌道の設定。radiusFraction は size/2 に対する割合。
 * BinaryStars バッジの「二重星が互いを周回する」視覚表現。
 */
const STELLAR_ORBITS = [
  { key: 'inner', radiusFraction: 0.30, duration: 4000 },
  { key: 'mid',   radiusFraction: 0.46, duration: 7000 },
  { key: 'outer', radiusFraction: 0.62, duration: 11000 },
] as const;

interface StellarSystemOverlayProps {
  size: number;
  color: string;
}

/**
 * 恒星系の軌道オーバーレイ。BinaryStars バッジ専用。
 * 3本の楕円軌道 + 各軌道を周回する小さな惑星ドット。
 * 惑星ドットは Reanimated で軌道上を回転する。
 */
function StellarSystemOverlay({ size, color }: StellarSystemOverlayProps) {
  const orbitalRadii = STELLAR_ORBITS.map((o) => o.radiusFraction * (size / 2));

  return (
    <View
      testID="stellar-system-overlay"
      pointerEvents="none"
      style={[styles.stellarOverlay, { width: size, height: size }]}
    >
      {/* 軌道リング（SVG 円） */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {STELLAR_ORBITS.map((orbit, i) => (
          <Circle
            key={orbit.key}
            testID="orbital-ring"
            cx={size / 2}
            cy={size / 2}
            r={orbitalRadii[i]}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.28}
          />
        ))}
      </Svg>

      {/* 惑星ドット（Reanimated で回転） */}
      {STELLAR_ORBITS.map((orbit, i) => (
        <PlanetDot
          key={orbit.key}
          size={size}
          radius={orbitalRadii[i]}
          color={color}
          duration={orbit.duration}
        />
      ))}
    </View>
  );
}

interface PlanetDotProps {
  size: number;
  radius: number;
  color: string;
  duration: number;
}

/**
 * 軌道上を一定速度で周回する惑星ドット。
 * コンテナ全体を回転させ、ドットを半径位置に固定することで等速円運動を実現する。
 */
function PlanetDot({ size, radius, color, duration }: PlanetDotProps) {
  const angle = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [angle, duration]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  const dotSize = 4.5;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          top: 0,
          left: 0,
        },
        rotateStyle,
      ]}
    >
      <View
        testID="planet-dot"
        style={{
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          opacity: 0.9,
          top: size / 2 - dotSize / 2,
          left: size / 2 + radius - dotSize / 2,
        }}
      />
    </Animated.View>
  );
}

// ── UnlockedBadgeOrb ───────────────────────────────────────────────────────

interface UnlockedBadgeOrbProps {
  colors: [string, string, string];
  glowColor: string;
  size: number;
  chapterConfig: ReturnType<typeof getOrbConfig>;
  showSaturnRing: boolean;
  showStellarOverlay: boolean;
}

function UnlockedBadgeOrb({
  colors,
  glowColor,
  size,
  chapterConfig,
  showSaturnRing,
  showStellarOverlay,
}: UnlockedBadgeOrbProps) {
  const { time, pulseStyle } = useOrbBreathing(chapterConfig);

  const [c1, c2] = colors;

  const containerSize = size * 1.6;
  const offset = (containerSize - size) / 2;

  // glow はバッジ固有の glow カラーをそのまま使う
  const orbGlowColor = c2;

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
          glowColor={orbGlowColor}
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

      {showSaturnRing && (
        <SaturnRing size={size} color={glowColor} containerSize={containerSize} />
      )}

      {showStellarOverlay && (
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <StellarSystemOverlay size={size} color={glowColor} />
        </View>
      )}
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
  saturnRingContainer: {
    position: 'absolute',
  },
  stellarOverlay: {
    position: 'absolute',
  },
});
