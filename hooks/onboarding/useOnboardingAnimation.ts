import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import { STEPS, canGoBack } from '@/constants/onboarding';

const SWIPE_THRESHOLD = 50;

interface UseOnboardingAnimationOptions {
  stateRef: React.MutableRefObject<{ step: number }>;
  canAdvanceAt: (step: number) => boolean;
  goToStep: (step: number) => void;
  autoAdvancingRef: React.MutableRefObject<boolean>;
}

export function useOnboardingAnimation({
  stateRef,
  canAdvanceAt,
  goToStep,
  autoAdvancingRef,
}: UseOnboardingAnimationOptions) {
  const translateX = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: number, callback: () => void) => {
    Animated.timing(translateX, {
      toValue: direction * 300,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(direction * -300);
      callback();
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => {
        const cs = STEPS[stateRef.current.step];
        if (cs.type === 'analyzing') return false;
        return Math.abs(gs.dx) > 20 && Math.abs(gs.dy) < 50;
      },
      onPanResponderRelease: (_, gs) => {
        if (autoAdvancingRef.current) return;
        const s = stateRef.current.step;
        if (gs.dx < -SWIPE_THRESHOLD) {
          if (s < STEPS.length - 1 && canAdvanceAt(s)) {
            animateTransition(-1, () => goToStep(s + 1));
          }
        } else if (gs.dx > SWIPE_THRESHOLD) {
          if (canGoBack(s)) {
            animateTransition(1, () => goToStep(s - 1));
          }
        }
      },
    }),
  ).current;

  return { translateX, animateTransition, panResponder };
}
