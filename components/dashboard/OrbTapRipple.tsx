import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { ORB_TAP } from '@/constants/orbAnimation';

interface OrbTapRippleProps {
  size: number;
  color: string;
  trigger: SharedValue<number>;
}

/**
 * Expanding border-only ring that fires on each trigger increment.
 * Purely decorative — pointerEvents="none".
 */
export function OrbTapRipple({ size, color, trigger }: OrbTapRippleProps) {
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => trigger.value,
    (current, previous) => {
      if (current !== previous && current > 0) {
        rippleScale.value = 1;
        rippleOpacity.value = ORB_TAP.rippleInitialOpacity;
        rippleScale.value = withTiming(ORB_TAP.rippleScale, {
          duration: ORB_TAP.rippleDuration,
          easing: Easing.out(Easing.cubic),
        });
        rippleOpacity.value = withTiming(0, {
          duration: ORB_TAP.rippleDuration,
          easing: Easing.out(Easing.cubic),
        });
      }
    },
  );

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <Animated.View
      testID="orb-tap-ripple"
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        rippleStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});
