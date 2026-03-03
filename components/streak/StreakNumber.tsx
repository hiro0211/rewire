import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useCountUpAnimation } from '@/hooks/streak/useCountUpAnimation';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface StreakNumberProps {
  streak: number;
}

export function StreakNumber({ streak }: StreakNumberProps) {
  const { colors } = useTheme();
  const { animatedStreak, scale, opacity } = useCountUpAnimation(streak);

  const animatedProps = useAnimatedProps(() => ({
    text: String(Math.round(animatedStreak.value)),
    defaultValue: '0',
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View testID="streak-number" style={[styles.container, animatedStyle]}>
      <AnimatedTextInput
        editable={false}
        style={[styles.number, { color: colors.text }]}
        animatedProps={animatedProps}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 96,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
    lineHeight: 110,
  },
});
