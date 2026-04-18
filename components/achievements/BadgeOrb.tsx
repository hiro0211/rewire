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
import { Circle, Ellipse, Path, Svg } from 'react-native-svg';

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
  const showGalaxySpiral = badgeId === 'Galaxy';
  const showStarCluster = badgeId === 'StarCluster';
  const showCosmos = badgeId === 'Cosmos';

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
      showGalaxySpiral={showGalaxySpiral}
      showStarCluster={showStarCluster}
      showCosmos={showCosmos}
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

// ── GalaxySpiral ───────────────────────────────────────────────────────────

interface GalaxySpiralProps {
  size: number;
  color: string;
}

/**
 * 対数螺旋を2本描画する銀河の渦巻きアーム。Galaxy バッジ専用。
 * r = a * e^(b*θ) の近似をデカルト座標に変換してSVGパスを生成する。
 * Reanimated でゆっくり回転（周期 8000ms）。
 */
function GalaxySpiral({ size, color }: GalaxySpiralProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cx = size / 2;
  const cy = size / 2;

  /** 対数螺旋パスを生成（arm=0: 基準, arm=1: 180°位相差） */
  function buildSpiralPath(phaseOffset: number): string {
    const a = 0.08;
    const b = 0.25;
    const steps = 80;
    const thetaMax = 4 * Math.PI;
    const scale = size * 0.38;

    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * thetaMax + phaseOffset;
      const r = a * Math.exp(b * theta) * scale;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      points.push([x, y]);
    }

    const [first, ...rest] = points;
    const d = [`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`];
    for (const [px, py] of rest) {
      d.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
    }
    return d.join(' ');
  }

  const arm1Path = buildSpiralPath(0);
  const arm2Path = buildSpiralPath(Math.PI);

  return (
    <Animated.View
      testID="galaxy-spiral"
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size }, rotateStyle]}
    >
      <Svg width={size} height={size}>
        <Path
          testID="galaxy-spiral-arm"
          d={arm1Path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.4}
        />
        <Path
          testID="galaxy-spiral-arm"
          d={arm2Path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.3}
        />
      </Svg>
    </Animated.View>
  );
}

// ── StarClusterOverlay ────────────────────────────────────────────────────

interface StarClusterOverlayProps {
  size: number;
  color: string;
}

/** 各衛星球の固定配置設定 */
const SATELLITE_CONFIG = [
  { angle: 0,   distFraction: 0.55 },
  { angle: 60,  distFraction: 0.52 },
  { angle: 120, distFraction: 0.58 },
  { angle: 180, distFraction: 0.50 },
  { angle: 240, distFraction: 0.56 },
  { angle: 300, distFraction: 0.54 },
] as const;

/**
 * 星団バッジ専用の複数コア描画。
 * 中央コアは既存の CoreOrbRenderer が担当し、周辺に6個の小球を配置する。
 * 各小球は Reanimated で独立した透明度ゆらぎアニメーションを持つ。
 */
function StarClusterOverlay({ size, color }: StarClusterOverlayProps) {
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View
      testID="star-cluster-overlay"
      pointerEvents="none"
      style={{ position: 'absolute', width: size, height: size }}
    >
      {SATELLITE_CONFIG.map((cfg, i) => (
        <SatelliteStar
          key={i}
          cx={cx}
          cy={cy}
          size={size}
          color={color}
          angle={cfg.angle}
          distFraction={cfg.distFraction}
          phaseSeed={i * 300}
        />
      ))}
    </View>
  );
}

interface SatelliteStarProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  angle: number;
  distFraction: number;
  phaseSeed: number;
}

function SatelliteStar({ cx, cy, size, color, angle, distFraction, phaseSeed }: SatelliteStarProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const period = 1800 + phaseSeed;
    opacity.value = withRepeat(
      withTiming(0.9, { duration: period, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [opacity, phaseSeed]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const rad = (angle * Math.PI) / 180;
  const dist = distFraction * (size / 2);
  const dotSize = size * 0.1;
  const left = cx + dist * Math.cos(rad) - dotSize / 2;
  const top = cy + dist * Math.sin(rad) - dotSize / 2;

  return (
    <Animated.View
      testID="star-cluster-satellite"
      style={[
        {
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
          left,
          top,
        },
        animStyle,
      ]}
    />
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

// ── CosmosOverlay ─────────────────────────────────────────────────────────

/** 全バッジのコアカラーから選ぶ宇宙光点カラーパレット */
const COSMOS_PARTICLE_COLORS = [
  '#C9CBE0', '#B8A9D4', '#D4C5A0',
  '#FFB547', '#FFD700', '#FFF0C0',
  '#D17842', '#A0785A', '#C45030',
  '#4A90E2', '#2ECC71', '#8B5CF6',
  '#5CE1E6', '#00D4FF', '#38BDF8',
  '#EC4899', '#A855F7', '#F43F5E',
] as const;

interface CosmosParticleConfig {
  x: number;
  y: number;
  r: number;
  color: string;
  period: number;
}

/** 25個の光点を決定論的に配置する（毎回同じ位置を保証） */
function buildParticleConfigs(size: number): CosmosParticleConfig[] {
  // 疑似乱数（シード固定）でランダム感を演出
  const configs: CosmosParticleConfig[] = [];
  const count = 25;
  for (let i = 0; i < count; i++) {
    // シード付き疑似配置: 黄金角でらせん配置
    const angle = i * 2.399963; // 黄金角 ≈ 137.5°
    const radFraction = 0.2 + (i / count) * 0.75;
    const r = radFraction * (size / 2);
    configs.push({
      x: size / 2 + r * Math.cos(angle),
      y: size / 2 + r * Math.sin(angle),
      r: 1.5 + (i % 3) * 0.8,
      color: COSMOS_PARTICLE_COLORS[i % COSMOS_PARTICLE_COLORS.length],
      period: 1200 + (i * 180) % 1600,
    });
  }
  return configs;
}

interface CosmosOverlayProps {
  size: number;
}

/**
 * 宇宙バッジ専用の全色光点オーバーレイ。
 * 25個の光点を黄金角スパイラルで配置し、各点が独立して点滅する。
 */
function CosmosOverlay({ size }: CosmosOverlayProps) {
  const particles = buildParticleConfigs(size);

  return (
    <View
      testID="cosmos-overlay"
      pointerEvents="none"
      style={{ position: 'absolute', width: size, height: size }}
    >
      {particles.map((p, i) => (
        <CosmosParticle key={i} config={p} />
      ))}
    </View>
  );
}

function CosmosParticle({ config }: { config: CosmosParticleConfig }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1.0, { duration: config.period, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [opacity, config.period]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      testID="cosmos-particle"
      style={[
        {
          position: 'absolute',
          width: config.r * 2,
          height: config.r * 2,
          borderRadius: config.r,
          backgroundColor: config.color,
          left: config.x - config.r,
          top: config.y - config.r,
        },
        animStyle,
      ]}
    />
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
  showGalaxySpiral: boolean;
  showStarCluster: boolean;
  showCosmos: boolean;
}

function UnlockedBadgeOrb({
  colors,
  glowColor,
  size,
  chapterConfig,
  showSaturnRing,
  showStellarOverlay,
  showGalaxySpiral,
  showStarCluster,
  showCosmos,
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

      {showGalaxySpiral && (
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <GalaxySpiral size={size} color={glowColor} />
        </View>
      )}

      {showStarCluster && (
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <StarClusterOverlay size={size} color={glowColor} />
        </View>
      )}

      {showCosmos && (
        <View
          pointerEvents="none"
          style={[styles.overlay, { width: size, height: size, left: offset, top: offset }]}
        >
          <CosmosOverlay size={size} />
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
