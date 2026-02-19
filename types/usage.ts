export interface BrowsingSession {
  domain: string;
  duration: number; // milliseconds
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  totalDuration: number; // milliseconds
  sessionCount: number;
}

export interface UsageStats {
  todayMinutes: number;
  weeklyData: DailyUsage[];
  monthlyMinutes: number;
  trendPercent: number; // negative = improvement
}
