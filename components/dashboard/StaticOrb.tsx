import type { BadgeColorTriad } from '@/constants/badges/BadgeColorTriad';
import type { BadgeId } from '@/constants/badges/BadgeId';
import { hasCosmicTexture } from '@/constants/cosmic/cosmicTextureMap';
import { hasPlanetTexture } from '@/constants/planets/planetTextureMap';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { CoreOrbRenderer } from './CoreOrbRenderer';
import { CosmicFieldRenderer } from './CosmicFieldRenderer';
import { PlanetOrbRenderer } from './PlanetOrbRenderer';

interface StaticOrbProps {
  colors: BadgeColorTriad;
  size: number;
  /**
   * 指定時は惑星/宇宙の実写テクスチャで描画する。
   * カルーセルの非アクティブ項目でも見栄えさせるため。
   * undefined（locked のゴースト等）のときは従来の手続きシェーダー。
   */
  badgeId?: BadgeId;
}

/**
 * 静止版オーブ。pulse / glow / particle / tap を省略し、
 * time を固定値で 1 回だけ描画する。locked / inactive の視認性改善用。
 * badgeId があれば実写テクスチャ（惑星 or 宇宙フィールド）を出す。
 */
export function StaticOrb({ colors, size, badgeId }: StaticOrbProps) {
  // time=1.2 は shader の beam パターンが最も顕著なフェーズ
  const time = useSharedValue(1.2);

  const orbColors = [colors.core, colors.mid, colors.outer] as const;

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
      {badgeId && hasPlanetTexture(badgeId) ? (
        <PlanetOrbRenderer
          badgeId={badgeId}
          size={size}
          time={time}
          orbColors={orbColors}
        />
      ) : badgeId && hasCosmicTexture(badgeId) ? (
        <CosmicFieldRenderer
          badgeId={badgeId}
          size={size}
          time={time}
          glowColor={colors.glow}
          orbColors={orbColors}
        />
      ) : (
        <CoreOrbRenderer
          colors={orbColors}
          size={size}
          time={time}
          testID="static-orb-canvas"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    overflow: 'hidden',
  },
});
