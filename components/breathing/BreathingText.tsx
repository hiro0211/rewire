import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { FONT_SIZE } from '@/constants/theme';
import type { BreathPhase } from '@/hooks/breathing/useBreathingEngine';

interface BreathingTextProps {
  phase: BreathPhase;
}

export function BreathingText({ phase }: BreathingTextProps) {
  const opacity = useSharedValue(0);
  const { colors } = useTheme();
  const { t } = useLocale();
  const text = phase === 'inhale' ? t('breathing.inhale') :
               phase === 'exhale' ? t('breathing.exhale') :
               t('breathing.preparing');

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
    <Animated.Text style={[styles.text, { color: colors.text }, animatedStyle]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    textAlign: 'center',
    position: 'absolute',
    top: '30%', // Position above circle
    width: '100%',
  },
});
