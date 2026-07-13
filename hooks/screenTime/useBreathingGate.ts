import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { BREATHING_CONFIG } from '@/constants/breathing';
import type { BreathPhase } from '@/hooks/breathing/useBreathingEngine';

const GATE_CYCLES = 3;

/**
 * ブロッカーOFF前の「深呼吸ゲート」用の呼吸フェーズ制御。
 *
 * active の間、吸う→止める→吐くを GATE_CYCLES 回繰り返し、完了で done=true。
 * SOS の useBreathingEngine と違い、画面遷移や連続ハプティクスは持たない
 * （モーダル内で完結し、完了後は確認ステップに切り替わる）。
 */
export function useBreathingGate(active: boolean): {
  phase: BreathPhase;
  cycleCount: number;
  done: boolean;
} {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const cycleCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      cycleCountRef.current = 0;
      setCycleCount(0);
      setPhase('idle');
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      setPhase('inhale');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('hold');
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        timerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setPhase('exhale');
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          timerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            cycleCountRef.current += 1;
            setCycleCount(cycleCountRef.current);
            if (cycleCountRef.current >= GATE_CYCLES) {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setPhase('complete');
            } else {
              runCycle();
            }
          }, BREATHING_CONFIG.EXHALE_DURATION);
        }, BREATHING_CONFIG.HOLD_DURATION);
      }, BREATHING_CONFIG.INHALE_DURATION);
    };

    cycleCountRef.current = 0;
    setCycleCount(0);
    runCycle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  return { phase, cycleCount, done: phase === 'complete' };
}
