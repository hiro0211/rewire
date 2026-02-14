import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { BREATHING_CONFIG } from '@/constants/breathing';

export type BreathPhase = 'idle' | 'inhale' | 'exhale' | 'complete';

export const useBreathingEngine = () => {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const startSession = () => {
    setCycleCount(0);
    setPhase('inhale');
    runCycle();
  };

  const runCycle = () => {
    setPhase('inhale');
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('exhale');
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setCycleCount((c) => {
          const nextCount = c + 1;
          if (nextCount >= BREATHING_CONFIG.CYCLES_PER_SESSION) {
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
