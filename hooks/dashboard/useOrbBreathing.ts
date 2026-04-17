import { useEffect } from 'react';
import { AppState } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useFrameCallback,
} from 'react-native-reanimated';

interface OrbBreathingConfig {
  scaleMin: number;
  scaleMax: number;
  pulseDuration: number;
}

/**
 * オーブの呼吸アニメーション（パルス + time 進行）。
 * AnimatedOrb と UnlockedBadgeOrb の共通ロジック。
 */
export function useOrbBreathing(config: OrbBreathingConfig) {
  const time = useSharedValue(0);
  const active = useSharedValue(true);
  const breathingScale = useSharedValue(config.scaleMin);

  useEffect(() => {
    breathingScale.value = withRepeat(
      withTiming(config.scaleMax, {
        duration: config.pulseDuration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [config.scaleMax, config.pulseDuration]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      active.value = state === 'active';
    });
    return () => sub.remove();
  }, []);

  useFrameCallback((info) => {
    if (active.value) {
      time.value = (info.timeSinceFirstFrame ?? 0) / 1000;
    }
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  return { time, breathingScale, pulseStyle };
}
