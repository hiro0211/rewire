import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STAR_COUNT = 40;

function TwinkleStar({ star }: { star: { id: number; left: number; top: number; size: number; opacity: number } }) {
  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 2000 + (star.id * 317) % 2000;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 0.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      testID={`star-dot-${star.id}`}
      style={[
        styles.star,
        {
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: Animated.multiply(animValue, star.opacity),
        },
      ]}
    />
  );
}

/**
 * 透明な星オーバーレイ。AuroraBackground の上に重ねて使う。
 * 背景色・グラデーションは持たない。タッチイベントは透過する。
 */
export function StarryOverlay() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      left: (((i * 37 + 13) % 97) / 97) * SCREEN_WIDTH,
      top: (((i * 53 + 29) % 89) / 89) * SCREEN_HEIGHT,
      size: 1 + ((i * 17) % 3),
      opacity: 0.3 + ((i * 23) % 7) / 10,
    }));
  }, []);

  return (
    <View
      testID="starry-overlay"
      pointerEvents="none"
      style={styles.overlay}
    >
      {stars.map((star) => (
        <TwinkleStar key={star.id} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
