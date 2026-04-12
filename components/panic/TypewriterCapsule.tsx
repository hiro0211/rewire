import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TYPEWRITER_CONFIG } from '@/constants/panic';
import type { TypewriterPhase } from '@/hooks/panic/useTypewriterMessage';

interface TypewriterCapsuleProps {
  displayedText: string;
  phase: TypewriterPhase;
}

/**
 * Capsule overlay that shows the rotating typewriter messages on top of the
 * camera preview. Animates scale + opacity according to the current phase so
 * messages fade in, type out, pause, and fade out smoothly.
 */
export function TypewriterCapsule({ displayedText, phase }: TypewriterCapsuleProps) {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (phase === 'entering' || phase === 'interval') {
      scale.value = 0.1;
      opacity.value = 0;
      return;
    }

    if (phase === 'typing' || phase === 'pausing') {
      scale.value = withTiming(1, {
        duration: TYPEWRITER_CONFIG.ENTER_DURATION_MS,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, {
        duration: TYPEWRITER_CONFIG.ENTER_DURATION_MS,
      });
      return;
    }

    if (phase === 'exiting') {
      scale.value = withTiming(0.1, {
        duration: TYPEWRITER_CONFIG.EXIT_DURATION_MS,
        easing: Easing.in(Easing.quad),
      });
      opacity.value = withTiming(0, {
        duration: TYPEWRITER_CONFIG.EXIT_DURATION_MS,
      });
    }
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.capsule, animatedStyle]}>
      <Animated.Text style={styles.text}>{displayedText || ' '}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(44, 44, 46, 0.85)',
    maxWidth: '90%',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
