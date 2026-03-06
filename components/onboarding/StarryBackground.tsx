import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STAR_COUNT = 40;

const DEFAULT_GRADIENT_COLORS = ['#0B1026', '#0D1B2A', '#121A30'];

interface StarryBackgroundProps {
  children: React.ReactNode;
  gradientColors?: string[];
  showStars?: boolean;
  twinkle?: boolean;
}

function TwinkleStar({ star }: { star: { id: number; left: number; top: number; size: number; opacity: number } }) {
  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 2000 + (star.id * 317) % 2000; // 2000–4000ms per star
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

export function StarryBackground({ children, gradientColors, showStars = true, twinkle = false }: StarryBackgroundProps) {
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
    <View testID="starry-background" style={styles.container}>
      <LinearGradient
        testID="starry-gradient"
        colors={gradientColors ?? DEFAULT_GRADIENT_COLORS}
        style={StyleSheet.absoluteFill}
      />
      {showStars && stars.map((star) =>
        twinkle ? (
          <TwinkleStar key={star.id} star={star} />
        ) : (
          <View
            key={star.id}
            testID={`star-dot-${star.id}`}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
            ]}
          />
        ),
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
