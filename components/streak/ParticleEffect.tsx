import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 12;

interface ParticleProps {
  index: number;
  delay: number;
}

function Particle({ index, delay }: ParticleProps) {
  const translateY = useSharedValue(height);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  const startX = (width / PARTICLE_COUNT) * index + Math.random() * 30;

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    ));
    translateY.value = withDelay(delay, withRepeat(
      withTiming(-100, { duration: 4000 + Math.random() * 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    ));
    translateX.value = withDelay(delay, withRepeat(
      withTiming(Math.random() * 40 - 20, { duration: 2000 }),
      -1,
      true,
    ));
    scale.value = withDelay(delay, withRepeat(
      withTiming(0.8 + Math.random() * 0.4, { duration: 2500 }),
      -1,
      true,
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX },
        animatedStyle,
      ]}
    />
  );
}

export function ParticleEffect() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    index: i,
    delay: i * 300,
  }));

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.index} index={p.index} delay={p.delay} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
});
