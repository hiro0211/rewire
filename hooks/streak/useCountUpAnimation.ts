import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { getCountUpDuration, COUNT_UP_ANIMATION } from '@/constants/streakCelebration';

export const useCountUpAnimation = (targetStreak: number) => {
  const animatedStreak = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const duration = getCountUpDuration(targetStreak);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 300 });

    // Count up from 0 to target
    animatedStreak.value = withTiming(targetStreak, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    // Scale: start small → normal, then bounce on completion
    scale.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(
        duration - 300,
        withSequence(
          withSpring(COUNT_UP_ANIMATION.bounceTo, { damping: 8, stiffness: 200 }),
          withSpring(COUNT_UP_ANIMATION.bounceBack, { damping: 12, stiffness: 150 }),
        ),
      ),
    );
  }, [targetStreak]);

  const animatedTextProps = useAnimatedProps(() => ({
    text: String(Math.round(animatedStreak.value)),
    defaultValue: '0',
  }));

  return {
    animatedStreak,
    scale,
    opacity,
    animatedTextProps,
    duration,
  };
};
