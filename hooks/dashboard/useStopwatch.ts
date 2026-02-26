import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import {
  calculateStopwatchTime,
  formatStopwatchTime,
  type StopwatchTime,
} from '@/lib/stats/statsCalculator';

interface UseStopwatchResult extends StopwatchTime {
  formatted: string;
}

export function useStopwatch(startDate: string | null): UseStopwatchResult {
  const compute = useCallback(() => {
    const time = calculateStopwatchTime(startDate);
    return { ...time, formatted: formatStopwatchTime(time) };
  }, [startDate]);

  const [value, setValue] = useState<UseStopwatchResult>(compute);

  useEffect(() => {
    setValue(compute());

    // Tick every 60 seconds
    const interval = setInterval(() => {
      setValue(compute());
    }, 60_000);

    // Refresh on app foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setValue(compute());
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [compute]);

  return value;
}
