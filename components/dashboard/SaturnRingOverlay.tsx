import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

interface SaturnRingOverlayProps {
  /** オーブ本体（球体）のサイズ */
  size: number;
  /** リングの色（通常は badge.glow） */
  color: string;
  /** リングをセンタリングする外側コンテナのサイズ */
  containerSize: number;
}

/**
 * 土星の環を模した楕円オーバーレイ。saturn バッジ専用。
 * オーブ本体の手前レイヤーに配置し、-20° 傾けて奥行き感を出す。
 * AnimatedOrb（ホーム）・BadgeOrb（Achievements）で共有する。
 */
export function SaturnRingOverlay({ size, color, containerSize }: SaturnRingOverlayProps) {
  const ringW = size * 1.45;
  const ringH = size * 0.32;
  const cx = ringW / 2;
  const cy = ringH / 2;

  return (
    <View
      testID="saturn-ring"
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: ringW,
          height: ringH,
          top: (containerSize - ringH) / 2,
          left: (containerSize - ringW) / 2,
        },
      ]}
    >
      <Svg width={ringW} height={ringH}>
        {/* 後ろ半楕円（下側）— zOrder のため先に描画 */}
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
        {/* 前半楕円（上側）— 不透明度を高めて立体感を強調 */}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
