import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GravityThreadProps {
  /** 前のバッジの glow カラー（アクティブ時に使う） */
  color: string;
  /** 前バッジがアンロック済みなら true = 発光、false = 薄い白 */
  isActive: boolean;
  /** S字カーブの向き */
  direction: 'left' | 'right';
  /** 縦方向の高さ（px） */
  height?: number;
  /** 横方向の幅（px） */
  width?: number;
}

const INACTIVE_STROKE = 'rgba(255,255,255,0.1)';

/**
 * バッジ同士を繋ぐ「重力の糸」。
 * 三次ベジエ曲線で緩やかなS字を描く。
 */
export function GravityThread({
  color,
  isActive,
  direction,
  height = 80,
  width = 60,
}: GravityThreadProps) {
  const stroke = isActive ? color : INACTIVE_STROKE;
  const opacity = isActive ? 0.6 : 1;

  // S字曲線: 上端から下端へ、指定方向に膨らむ
  const startX = width / 2;
  const endX = width / 2;
  // Control points sway outward to create a gentle S-curve
  const sway = direction === 'right' ? width * 0.45 : -width * 0.45;
  const c1x = startX + sway;
  const c1y = height * 0.33;
  const c2x = endX - sway;
  const c2y = height * 0.66;

  const d = `M ${startX} 0 C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${height}`;

  return (
    <Svg width={width} height={height}>
      <Path
        d={d}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={opacity}
      />
    </Svg>
  );
}
