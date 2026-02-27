import { create } from 'zustand';
import { userStorage } from '@/lib/storage/userStorage';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import { useCheckinStore } from './checkinStore';
import { useBreathStore } from './breathStore';
import { syncWidgetData, clearWidgetData } from '@/lib/widget/widgetDataSync';
import { calculateRelapseCount } from '@/lib/stats/statsCalculator';
import type { User } from '@/types/models';

interface UserState {
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface UserActions {
  setUser: (user: User) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  isLoading: false,
  hasHydrated: false,

  setUser: async (user) => {
    set({ user });
    await userStorage.save(user);
    const checkins = useCheckinStore.getState().checkins;
    await syncWidgetData({
      streakStartDate: user.streakStartDate,
      goalDays: user.goalDays,
      relapseCount: calculateRelapseCount(checkins),
    });
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      await userStorage.save(updatedUser);
      const checkins = useCheckinStore.getState().checkins;
      await syncWidgetData({
        streakStartDate: updatedUser.streakStartDate,
        goalDays: updatedUser.goalDays,
        relapseCount: calculateRelapseCount(checkins),
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userStorage.get();
      set({ user, hasHydrated: true });
      if (user) {
        const checkins = useCheckinStore.getState().checkins;
        await syncWidgetData({
          streakStartDate: user.streakStartDate,
          goalDays: user.goalDays,
          relapseCount: calculateRelapseCount(checkins),
        });
      }
    } catch (e) {
      console.error('Failed to load user', e);
      set({ hasHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: async () => {
    set({ user: null });
    await asyncStorageClient.clearAll();
    useCheckinStore.getState().reset();
    useBreathStore.getState().reset();
    await clearWidgetData();
  },
}));
