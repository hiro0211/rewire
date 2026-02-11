import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';
import { BREATHING_CONFIG } from '@/constants/breathing';
import type { BreathPhase } from '@/hooks/breathing/useBreathingEngine';

interface BreathingCircleProps {
  phase: BreathPhase;
}

export function BreathingCircle({ phase }: BreathingCircleProps) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (phase === 'inhale') {
      scale.value = withTiming(1, {
        duration: BREATHING_CONFIG.INHALE_DURATION,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
      opacity.value = withTiming(0.8, { duration: BREATHING_CONFIG.INHALE_DURATION });
    } else if (phase === 'exhale') {
      scale.value = withTiming(0.4, {
        duration: BREATHING_CONFIG.EXHALE_DURATION,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
      opacity.value = withTiming(0.4, { duration: BREATHING_CONFIG.EXHALE_DURATION });
    }
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
