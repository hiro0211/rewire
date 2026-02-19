import { create } from 'zustand';
import { usageTrackerBridge } from '@/lib/usageTracker/usageTrackerBridge';
import type { DailyUsage } from '@/types/usage';

interface UsageState {
  todayMs: number;
  weeklyData: DailyUsage[];
  monthlyMs: number;
  hourlyWage: number;
  isLoading: boolean;
}

interface UsageActions {
  loadUsage: () => Promise<void>;
  setHourlyWage: (wage: number) => void;
  clearData: () => Promise<void>;
}

export const useUsageStore = create<UsageState & UsageActions>((set) => ({
  todayMs: 0,
  weeklyData: [],
  monthlyMs: 0,
  hourlyWage: 1000,
  isLoading: false,

  loadUsage: async () => {
    set({ isLoading: true });
    try {
      const [todayMs, weeklyData, monthlyMs] = await Promise.all([
        usageTrackerBridge.getTodayUsage(),
        usageTrackerBridge.getWeeklyUsage(),
        usageTrackerBridge.getMonthlyUsage(),
      ]);
      set({ todayMs, weeklyData, monthlyMs });
    } catch (e) {
      console.error('Failed to load usage data', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setHourlyWage: (wage: number) => {
    set({ hourlyWage: wage });
  },

  clearData: async () => {
    await usageTrackerBridge.clearAllData();
    set({ todayMs: 0, weeklyData: [], monthlyMs: 0 });
  },
}));
