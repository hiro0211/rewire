import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { useStopwatch } from './useStopwatch';
import { calculateRelapseCount } from '@/lib/stats/statsCalculator';
import { useMemo } from 'react';

export function useDashboardStats() {
  const { user } = useUserStore();
  const { checkins } = useCheckinStore();

  const streakStartDate = user?.streakStartDate ?? null;
  const goalDays = user?.goalDays ?? 30;

  const stopwatch = useStopwatch(streakStartDate);

  const relapseCount = useMemo(
    () => calculateRelapseCount(checkins),
    [checkins]
  );

  return {
    relapseCount,
    stopwatch,
    goalDays,
    streakStartDate,
  };
}
