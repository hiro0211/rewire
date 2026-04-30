import { useCallback, useEffect, useRef, useState } from 'react';
import { useStreak } from '@/hooks/dashboard/useStreak';
import {
  getLastCelebratedStreak,
  setLastCelebratedStreak,
} from '@/lib/storage/celebrationStorage';
import {
  shouldCelebrate,
  computeFromStreak,
} from '@/features/streak/celebrationPolicy';

interface UseStreakCelebrationResult {
  celebratingStreak: number | null;
  fromStreak: number;
  trigger: (targetStreak: number) => void;
  dismiss: () => void;
}

export function useStreakCelebration(): UseStreakCelebrationResult {
  const { streak: currentStreak } = useStreak();
  const [hydrated, setHydrated] = useState(false);
  const [lastCelebrated, setLastCelebrated] = useState<number | null>(null);
  const [celebratingStreak, setCelebratingStreak] = useState<number | null>(null);
  const visibleRef = useRef(false);

  // Hydrate from storage on mount
  useEffect(() => {
    let cancelled = false;
    getLastCelebratedStreak().then((value) => {
      if (cancelled) return;
      setLastCelebrated(value);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // After hydration: handle migration / relapse clamp / auto-trigger
  useEffect(() => {
    if (!hydrated) return;
    if (visibleRef.current) return;

    // First-time migration: silently snapshot current streak
    if (lastCelebrated === null) {
      setLastCelebratedStreak(currentStreak).catch(() => {});
      setLastCelebrated(currentStreak);
      return;
    }

    // Relapse clamp: streak dropped below recorded value
    if (currentStreak < lastCelebrated) {
      setLastCelebratedStreak(currentStreak).catch(() => {});
      setLastCelebrated(currentStreak);
      return;
    }

    // Auto-trigger
    if (shouldCelebrate({ currentStreak, lastCelebrated, hydrated })) {
      visibleRef.current = true;
      setCelebratingStreak(currentStreak);
    }
  }, [hydrated, lastCelebrated, currentStreak]);

  const trigger = useCallback(
    (targetStreak: number) => {
      if (visibleRef.current) return;
      if (targetStreak <= 0) return;
      visibleRef.current = true;
      setCelebratingStreak(targetStreak);
    },
    [],
  );

  const dismiss = useCallback(() => {
    setCelebratingStreak((prev) => {
      if (prev !== null) {
        setLastCelebratedStreak(prev).catch(() => {});
        setLastCelebrated(prev);
      }
      visibleRef.current = false;
      return null;
    });
  }, []);

  const fromStreak = computeFromStreak(
    celebratingStreak ?? currentStreak,
    lastCelebrated,
  );

  return { celebratingStreak, fromStreak, trigger, dismiss };
}
