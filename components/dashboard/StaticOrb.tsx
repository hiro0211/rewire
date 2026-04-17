import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { CoreOrbRenderer } from './CoreOrbRenderer';

interface StaticOrbProps {
  colors: BadgeColorTriad;
  size: number;
}

/**
 * 静止版オーブ。CoreOrbRenderer を time=1.2 で固定描画し、
 * radial beam の面影を保ったまま pulse / glow / particle を省略する。
 * locked / inactive の視認性改善用。
 */
export function StaticOrb({ colors, size }: StaticOrbProps) {
  // time=1.2 は shader の beam パターンが最も顕著なフェーズ
  const time = useSharedValue(1.2);

  return (
    <View
      testID="static-orb"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <CoreOrbRenderer
        colors={[colors.glow, colors.core, colors.accent]}
        size={size}
        time={time}
        testID="static-orb-canvas"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    overflow: 'hidden',
  },
});
