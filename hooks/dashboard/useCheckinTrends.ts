import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { useCheckinStore } from '@/stores/checkinStore';

export interface CheckinTrends {
  urgeLevel: number[];
  stressLevel: number[];
  qualityOfLife: number[];
}

export function useCheckinTrends(days = 7): CheckinTrends {
  const { checkins } = useCheckinStore();

  return useMemo(() => {
    const today = new Date();
    const dateLabels = Array.from({ length: days }, (_, i) =>
      format(subDays(today, days - 1 - i), 'yyyy-MM-dd'),
    );

    const urgeLevel: number[] = [];
    const stressLevel: number[] = [];
    const qualityOfLife: number[] = [];

    for (const date of dateLabels) {
      const entry = checkins.find((c) => c.date === date);
      urgeLevel.push(entry ? entry.urgeLevel : 0);
      stressLevel.push(entry ? entry.stressLevel : 0);
      qualityOfLife.push(entry ? entry.qualityOfLife : 1);
    }

    return { urgeLevel, stressLevel, qualityOfLife };
  }, [checkins, days]);
}
