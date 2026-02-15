import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BREATHING_CONFIG } from '@/constants/breathing';

export type BreathPhase = 'idle' | 'inhale' | 'exhale' | 'complete';

// 吸う: ガタガタと力強い断続的な振動（300ms間隔で Heavy）
const HAPTIC_INTERVAL_INHALE = 300;
// 吐く: スーッと流れるような連続振動（100ms間隔で Soft）
const HAPTIC_INTERVAL_EXHALE = 100;

export const useBreathingEngine = () => {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hapticTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const stopHaptic = () => {
    if (hapticTimerRef.current) {
      clearInterval(hapticTimerRef.current);
      hapticTimerRef.current = null;
    }
  };

  const startInhaleHaptic = () => {
    stopHaptic();
    // 吸う: ガタガタと強い断続振動
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    hapticTimerRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, HAPTIC_INTERVAL_INHALE);
  };

  const startExhaleHaptic = () => {
    stopHaptic();
    // 吐く: スーッと流れるような連続振動
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    hapticTimerRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }, HAPTIC_INTERVAL_EXHALE);
  };

  const startSession = () => {
    setCycleCount(0);
    setPhase('inhale');
    runCycle();
  };

  const runCycle = () => {
    setPhase('inhale');
    startInhaleHaptic();
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('exhale');
      startExhaleHaptic();
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setCycleCount((c) => {
          const nextCount = c + 1;
          if (nextCount >= BREATHING_CONFIG.CYCLES_PER_SESSION) {
            stopHaptic();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPhase('complete');
            return nextCount;
          } else {
            runCycle();
            return nextCount;
          }
        });
      }, BREATHING_CONFIG.EXHALE_DURATION);
    }, BREATHING_CONFIG.INHALE_DURATION);
  };

  // Navigate when session completes (safe: runs in useEffect, not in setState callback)
  useEffect(() => {
    if (phase === 'complete') {
      const navTimer = setTimeout(() => {
        if (mountedRef.current) {
          router.replace('/breathing/ask');
        }
      }, 1000);
      return () => clearTimeout(navTimer);
    }
  }, [phase]);

  const stopSession = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    stopHaptic();
    setPhase('idle');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSession();
    };
  }, [stopSession]);

  return { phase, cycleCount, startSession, stopSession };
};
