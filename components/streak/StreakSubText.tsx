import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZE } from '@/constants/theme';

interface StreakSubTextProps {
  text: string;
  delay?: number;
}

export function StreakSubText({ text, delay = 500 }: StreakSubTextProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, [text, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text
      testID="streak-sub-text"
      style={[styles.text, { color: colors.textSecondary }, animatedStyle]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
