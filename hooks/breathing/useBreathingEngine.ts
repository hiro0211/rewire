import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { BREATHING_CONFIG } from '@/constants/breathing';

export type BreathPhase = 'idle' | 'inhale' | 'exhale' | 'complete';

export const useBreathingEngine = () => {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    setCycleCount(0);
    setPhase('inhale');
    runCycle();
  };

  const runCycle = () => {
    // Inhale
    setPhase('inhale');
    timerRef.current = setTimeout(() => {
      // Exhale
      setPhase('exhale');
      timerRef.current = setTimeout(() => {
        setCycleCount((c) => {
          const nextCount = c + 1;
          if (nextCount >= BREATHING_CONFIG.CYCLES_PER_SESSION) {
            setPhase('complete');
            setTimeout(() => {
                router.replace('/breathing/ask');
            }, 1000);
            return nextCount;
          } else {
            // Next cycle
            runCycle();
            return nextCount;
          }
        });
      }, BREATHING_CONFIG.EXHALE_DURATION);
    }, BREATHING_CONFIG.INHALE_DURATION);
  };

  const stopSession = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setPhase('idle');
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return { phase, cycleCount, startSession, stopSession };
};
