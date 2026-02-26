import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STAR_COUNT = 40;

interface StarryBackgroundProps {
  children: React.ReactNode;
}

export function StarryBackground({ children }: StarryBackgroundProps) {
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
        colors={['#0B1026', '#0D1B2A', '#121A30']}
        style={StyleSheet.absoluteFill}
      />
      {stars.map((star) => (
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
      ))}
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
