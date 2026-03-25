export type DashboardSection =
  | 'streak'
  | 'chart'
  | 'checkin'
  | 'sos';

export interface TimeBasedLayout {
  sections: DashboardSection[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function useTimeBasedLayout(): TimeBasedLayout {
  const hour = new Date().getHours();

  // 朝 5-11時: チェックイン促進 → ストリーク
  if (hour >= 5 && hour < 12) {
    return {
      sections: ['checkin', 'streak', 'chart', 'sos'],
      timeOfDay: 'morning',
    };
  }

  // 昼 12-17時: ストリーク → チャート → SOS
  if (hour >= 12 && hour < 18) {
    return {
      sections: ['streak', 'chart', 'checkin', 'sos'],
      timeOfDay: 'afternoon',
    };
  }

  // 夜 18-22時: ストリーク大 → 振り返りチャート → SOS
  if (hour >= 18 && hour < 23) {
    return {
      sections: ['streak', 'checkin', 'chart', 'sos'],
      timeOfDay: 'evening',
    };
  }

  // 深夜 23-4時: ミニマル（SOS + ストリークのみ）
  return {
    sections: ['sos', 'streak'],
    timeOfDay: 'night',
  };
}
