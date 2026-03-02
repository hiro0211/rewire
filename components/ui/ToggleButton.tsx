import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RADIUS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ToggleButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function ToggleButton({ title, active, onPress }: ToggleButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 200 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.surfaceHighlight, colors.primary]
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.surfaceHighlight, colors.primary]
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        progress.value,
        [0, 1],
        [colors.textSecondary, colors.contrastText]
      ),
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.Text style={[styles.text, animatedTextStyle]}>
        {title}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
