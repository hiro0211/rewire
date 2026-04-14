import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface EntranceAnimationOptions {
  delay?: number;
  duration?: number;
  translateY?: number;
}

export function useEntranceAnimation({
  delay = 0,
  duration = 400,
  translateY = 20,
}: EntranceAnimationOptions = {}) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(translateY);

  useEffect(() => {
    const timingConfig = { duration, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(delay, withTiming(1, timingConfig));
    offset.value = withDelay(delay, withTiming(0, timingConfig));
  }, [delay, duration, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return { animatedStyle };
}
