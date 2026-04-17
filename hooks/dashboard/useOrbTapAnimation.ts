import { useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ORB_TAP } from '@/constants/orbAnimation';

/**
 * Manages tap animation state for AnimatedOrb:
 * - tapScale: shrink on press-in, elastic bounce on release
 * - glowIntensity: 0→1 on press-in, 1→0 on release
 * - rippleTrigger: incremented on release to fire ripple effect
 */
export function useOrbTapAnimation() {
  const tapScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const rippleTrigger = useSharedValue(0);

  const handlePressIn = () => {
    tapScale.value = withTiming(ORB_TAP.pressInScale, {
      duration: ORB_TAP.pressInDuration,
    });
    glowIntensity.value = withTiming(1, {
      duration: ORB_TAP.glowFadeInDuration,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    tapScale.value = withSpring(1, ORB_TAP.spring);
    glowIntensity.value = withTiming(0, {
      duration: ORB_TAP.glowFadeOutDuration,
    });
    rippleTrigger.value += 1;
  };

  return { tapScale, glowIntensity, rippleTrigger, handlePressIn, handlePressOut };
}
