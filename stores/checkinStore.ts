import { create } from 'zustand';
import { checkinStorage } from '@/lib/storage/checkinStorage';
import type { DailyCheckin } from '@/types/models';

interface CheckinState {
  checkins: DailyCheckin[];
  todayCheckin: DailyCheckin | null;
  isLoading: boolean;
}

interface CheckinActions {
  loadCheckins: () => Promise<void>;
  addCheckin: (checkin: DailyCheckin) => Promise<void>;
  removeTodayCheckin: () => Promise<void>;
  refreshTodayCheckin: () => void;
  reset: () => void;
}

export const useCheckinStore = create<CheckinState & CheckinActions>((set, get) => ({
  checkins: [],
  todayCheckin: null,
  isLoading: false,

  loadCheckins: async () => {
    set({ isLoading: true });
    try {
      const checkins = await checkinStorage.getAll();
      set({ checkins });
      get().refreshTodayCheckin();
    } catch (e) {
      console.error('Failed to load checkins', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addCheckin: async (checkin) => {
    // Optimistic update
    const { checkins } = get();
    const newCheckins = [checkin, ...checkins];
    set({ checkins: newCheckins, todayCheckin: checkin });

    await checkinStorage.save(checkin);
  },

  removeTodayCheckin: async () => {
    const today = new Date().toISOString().split('T')[0];
    await checkinStorage.remove(today);
    const { checkins } = get();
    set({
      checkins: checkins.filter((c) => c.date !== today),
      todayCheckin: null,
    });
  },

  refreshTodayCheckin: () => {
    const { checkins } = get();
    const today = new Date().toISOString().split('T')[0];
    const found = checkins.find((c) => c.date === today) || null;
    set({ todayCheckin: found });
  },

  reset: () => {
    set({ checkins: [], todayCheckin: null });
  },
}));
