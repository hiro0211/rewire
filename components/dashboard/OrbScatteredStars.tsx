import React, { useMemo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const STAR_COUNT = 10;

interface StarConfig {
  x: number;
  y: number;
  radius: number;
  delay: number;
}

interface OrbScatteredStarsProps {
  size: number;
}

/**
 * オーブ周囲にランダム配置される散布星パーティクル。
 * 各点が独立してゆっくり瞬く（twinkle）。
 * OrbParticles（軌道周回）とは異なり、固定位置で輝く。
 */
export function OrbScatteredStars({ size }: OrbScatteredStarsProps) {
  const containerSize = size * 2.0;

  const stars = useMemo<StarConfig[]>(() => {
    // 固定シード風ランダム（位置を安定させる）
    const list: StarConfig[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = (i / STAR_COUNT) * Math.PI * 2 + (i % 3) * 0.7;
      const distance = containerSize * (0.35 + (i % 4) * 0.08);
      list.push({
        x: containerSize / 2 + Math.cos(angle) * distance,
        y: containerSize / 2 + Math.sin(angle) * distance,
        radius: 1 + (i % 3),
        delay: (i * 300) % 1500,
      });
    }
    return list;
  }, [containerSize]);

  return (
    <View
      testID="orb-scattered-stars"
      pointerEvents="none"
      style={{ width: containerSize, height: containerSize }}
    >
      {stars.map((star, index) => (
        <StarDot key={index} star={star} />
      ))}
    </View>
  );
}

function StarDot({ star }: { star: StarConfig }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID="scattered-star"
      style={[
        {
          position: 'absolute',
          width: star.radius * 2,
          height: star.radius * 2,
          borderRadius: star.radius,
          backgroundColor: '#FFFFFF',
          left: star.x - star.radius,
          top: star.y - star.radius,
        },
        style,
      ]}
    />
  );
}
