import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

interface OrbSoftAuraProps {
  size: number;
  glowColor: string;
}

/**
 * オーブ背後に表示される大きく柔らかなハロー（後光）。
 * SVG RadialGradient で中心から外周にかけてフェードアウトし、
 * クロスプラットフォームで滑らかなグロー効果を提供する。
 */
export function OrbSoftAura({ size, glowColor }: OrbSoftAuraProps) {
  const uniqueId = useId();
  const gradId = `soft-aura-grad-${uniqueId}`;
  const containerSize = size * 2.0;

  return (
    <View
      testID="orb-soft-aura"
      pointerEvents="none"
      style={{ width: containerSize, height: containerSize }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={glowColor} stopOpacity="0.3" />
            <Stop offset="0.6" stopColor={glowColor} stopOpacity="0.1" />
            <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}
