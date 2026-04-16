import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface OrbParticlesProps {
  size: number;
  count: number;
  tintColor: string;
}

interface ParticleConfig {
  id: number;
  radius: number;
  startAngle: number;
  orbitDuration: number;
  dotSize: number;
  twinkleDuration: number;
}

function Particle({
  config,
  containerCenter,
  tintColor,
}: {
  config: ParticleConfig;
  containerCenter: number;
  tintColor: string;
}) {
  const angle = useSharedValue(config.startAngle);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(config.startAngle + Math.PI * 2, {
        duration: config.orbitDuration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0.2, {
        duration: config.twinkleDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const x = containerCenter + config.radius * Math.cos(angle.value) - config.dotSize / 2;
    const y = containerCenter + config.radius * Math.sin(angle.value) - config.dotSize / 2;
    return {
      position: 'absolute',
      left: x,
      top: y,
      width: config.dotSize,
      height: config.dotSize,
      borderRadius: config.dotSize / 2,
      opacity: opacity.value,
    };
  });

  // Alternate between white dots and chapter-tinted dots
  const bg = config.id % 2 === 0 ? '#FFFFFF' : tintColor;

  return (
    <Animated.View
      testID={`orb-particle-${config.id}`}
      style={[{ backgroundColor: bg }, animStyle]}
    />
  );
}

export function OrbParticles({ size, count, tintColor }: OrbParticlesProps) {
  const containerSize = size * 1.6;
  const containerCenter = containerSize / 2;

  const particles = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const ratio = i / Math.max(count, 1);
      return {
        id: i,
        radius: size * (0.55 + ratio * 0.2),
        startAngle: ratio * Math.PI * 2,
        orbitDuration: 15000 + (i * 2731) % 10000,
        dotSize: 2 + (i % 3),
        twinkleDuration: 1500 + (i * 1117) % 1500,
      };
    });
  }, [size, count]);

  return (
    <View
      testID="orb-particles"
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          left: -(containerSize - size) / 2,
          top: -(containerSize - size) / 2,
        },
      ]}
    >
      {particles.map((p) => (
        <Particle key={p.id} config={p} containerCenter={containerCenter} tintColor={tintColor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
