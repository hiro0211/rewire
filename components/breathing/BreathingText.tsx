import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS, FONT_SIZE } from '@/constants/theme';
import type { BreathPhase } from '@/hooks/breathing/useBreathingEngine';

interface BreathingTextProps {
  phase: BreathPhase;
}

export function BreathingText({ phase }: BreathingTextProps) {
  const opacity = useSharedValue(0);
  const text = phase === 'inhale' ? 'ゆっくり息を吸ってください' : 
               phase === 'exhale' ? 'ゆっくり息を吐いてください' : 
               '準備...';

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      opacity.value = withTiming(1, { duration: 500 });
    });
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });

  if (phase === 'idle' || phase === 'complete') return null;

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    textAlign: 'center',
    position: 'absolute',
    top: '30%', // Position above circle
    width: '100%',
  },
});
