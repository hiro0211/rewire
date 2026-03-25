import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { useCheckinStore } from '@/stores/checkinStore';

export interface ChartPoint {
  x: number;
  y: number;
  date: string;
  hasData: boolean;
}

export interface CheckinChartData {
  qualityPoints: ChartPoint[];
  urgencyPoints: ChartPoint[];
  dates: string[];
}

export function useCheckinChartData(days = 30): CheckinChartData {
  const { checkins } = useCheckinStore();

  return useMemo(() => {
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) =>
      format(subDays(today, days - 1 - i), 'yyyy-MM-dd'),
    );

    const qualityRaw: number[] = [];
    const urgencyRaw: number[] = [];
    const hasData: boolean[] = [];

    for (const date of dates) {
      const entry = checkins.find((c) => c.date === date);
      qualityRaw.push(entry ? entry.qualityOfLife : 3);
      urgencyRaw.push(entry ? entry.urgeLevel : 0);
      hasData.push(entry != null);
    }

    const toPoints = (values: number[], minV: number, maxV: number, svgWidth: number, svgHeight: number): ChartPoint[] => {
      const padY = 8;
      const range = maxV - minV;
      const stepX = svgWidth / Math.max(dates.length - 1, 1);
      return values.map((v, i) => ({
        x: i * stepX,
        y: padY + (1 - (v - minV) / range) * (svgHeight - padY * 2),
        date: dates[i],
        hasData: hasData[i],
      }));
    };

    // SVG coordinate conversion is done at render time; return normalized data
    const qualityPoints = toPoints(qualityRaw, 1, 5, 1, 1);
    const urgencyPoints = toPoints(urgencyRaw, 0, 4, 1, 1);

    return { qualityPoints, urgencyPoints, dates };
  }, [checkins, days]);
}
