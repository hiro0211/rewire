import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { BREATHING_CONFIG } from '@/constants/breathing';
import type { BreathPhase } from '@/hooks/breathing/useBreathingEngine';

interface BreathingTimerProps {
  phase: BreathPhase;
  cycleCount: number;
}

const isActive = (phase: BreathPhase): boolean =>
  phase === 'inhale' || phase === 'hold' || phase === 'exhale';

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
};

export function BreathingTimer({ phase, cycleCount }: BreathingTimerProps) {
  const { colors } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive(phase)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase]);

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
      <Text style={[styles.cycle, { color: colors.textSecondary }]}>
        {cycleCount} / {BREATHING_CONFIG.CYCLES_PER_SESSION}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cycle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
