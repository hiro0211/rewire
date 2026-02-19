import type { DailyUsage } from '@/types/usage';

export interface UsageTrackerBridge {
  getSessions: (startDate: string, endDate: string) => Promise<BrowsingSessionRaw[]>;
  getTodayUsage: () => Promise<number>;
  getWeeklyUsage: () => Promise<DailyUsage[]>;
  getMonthlyUsage: () => Promise<number>;
  clearAllData: () => Promise<void>;
  setDomainList: (domains: string[]) => Promise<void>;
  getDomainList: () => Promise<string[]>;
}

export interface BrowsingSessionRaw {
  domain: string;
  duration: number;
  date: string;
  timestamp: number;
}
