import { Platform } from 'react-native';
import type { DailyUsage } from '@/types/usage';
import type { UsageTrackerBridge, BrowsingSessionRaw } from './usageTrackerTypes';

const EMPTY_WEEKLY: DailyUsage[] = [];

/**
 * Lazily loads the native Expo Usage Tracker module.
 * Returns null when the native binary is unavailable (Expo Go / Android / Web).
 */
function getNativeModule(): {
  getSessions: (startDate: string, endDate: string) => Promise<BrowsingSessionRaw[]>;
  getTodayUsage: () => Promise<number>;
  getWeeklyUsage: () => Promise<DailyUsage[]>;
  getMonthlyUsage: () => Promise<number>;
  clearAllData: () => Promise<void>;
  setDomainList: (domains: string[]) => Promise<void>;
  getDomainList: () => Promise<string[]>;
} | null {
  try {
    const mod = require('../../modules/expo-usage-tracker/src').default;
    return mod ?? null;
  } catch {
    return null;
  }
}

export const usageTrackerBridge: UsageTrackerBridge = {
  async getSessions(startDate: string, endDate: string): Promise<BrowsingSessionRaw[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const mod = getNativeModule();
      if (!mod) return [];
      return await mod.getSessions(startDate, endDate);
    } catch (error) {
      console.error('[UsageTracker] getSessions failed:', error);
      return [];
    }
  },

  async getTodayUsage(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;
    try {
      const mod = getNativeModule();
      if (!mod) return 0;
      return await mod.getTodayUsage();
    } catch (error) {
      console.error('[UsageTracker] getTodayUsage failed:', error);
      return 0;
    }
  },

  async getWeeklyUsage(): Promise<DailyUsage[]> {
    if (Platform.OS !== 'ios') return EMPTY_WEEKLY;
    try {
      const mod = getNativeModule();
      if (!mod) return EMPTY_WEEKLY;
      return await mod.getWeeklyUsage();
    } catch (error) {
      console.error('[UsageTracker] getWeeklyUsage failed:', error);
      return EMPTY_WEEKLY;
    }
  },

  async getMonthlyUsage(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;
    try {
      const mod = getNativeModule();
      if (!mod) return 0;
      return await mod.getMonthlyUsage();
    } catch (error) {
      console.error('[UsageTracker] getMonthlyUsage failed:', error);
      return 0;
    }
  },

  async clearAllData(): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      const mod = getNativeModule();
      if (!mod) return;
      await mod.clearAllData();
    } catch (error) {
      console.error('[UsageTracker] clearAllData failed:', error);
    }
  },

  async setDomainList(domains: string[]): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      const mod = getNativeModule();
      if (!mod) return;
      await mod.setDomainList(domains);
    } catch (error) {
      console.error('[UsageTracker] setDomainList failed:', error);
    }
  },

  async getDomainList(): Promise<string[]> {
    if (Platform.OS !== 'ios') return [];
    try {
      const mod = getNativeModule();
      if (!mod) return [];
      return await mod.getDomainList();
    } catch (error) {
      console.error('[UsageTracker] getDomainList failed:', error);
      return [];
    }
  },
};
