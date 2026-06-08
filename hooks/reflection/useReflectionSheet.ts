import { create } from 'zustand';
import { format } from 'date-fns/format';
import { checkinService } from '@/features/checkin/checkinService';
import { useCheckinStore } from '@/stores/checkinStore';
import { useUserStore } from '@/stores/userStore';
import { useReflectionStore } from '@/stores/reflectionStore';
import { calculateStreak } from '@/features/checkin/streakCalculator';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { setRetentionUserProperties } from '@/lib/tracking/retentionUserProperties';

export type ReflectionStep = 1 | 2 | 3;

/** Where the daily reflection sheet was opened from (funnel attribution). */
export type ReflectionOpenSource = 'manual' | 'notification' | 'auto_reminder';

interface ReflectionFormState {
  watchedPorn: boolean | null;
  urgeLevel: number;
}

interface ReflectionSheetState {
  visible: boolean;
  step: ReflectionStep;
  formState: ReflectionFormState;
  isSubmitting: boolean;
  submitError: string | null;
  pendingCelebrationStreak: number | null;
}

interface ReflectionSheetActions {
  open: (source?: ReflectionOpenSource) => void;
  close: () => void;
  selectWatchedPorn: (value: boolean) => void;
  selectUrgeLevelAndSubmit: (level: number) => Promise<void>;
  confessRelapseAndClose: () => Promise<boolean>;
  finish: () => void;
  clearPendingCelebration: () => void;
  reset: () => void;
}

const INITIAL_STATE: ReflectionSheetState = {
  visible: false,
  step: 1,
  formState: { watchedPorn: null, urgeLevel: 0 },
  isSubmitting: false,
  submitError: null,
  pendingCelebrationStreak: null,
};

export const useReflectionSheet = create<ReflectionSheetState & ReflectionSheetActions>((set, get) => ({
  ...INITIAL_STATE,

  open: (source = 'manual') => {
    analyticsClient.logEvent('reflection_opened', { source });
    set({ ...INITIAL_STATE, visible: true });
  },

  close: () => {
    set({ visible: false });
  },

  selectWatchedPorn: (value) => {
    set({
      formState: { ...get().formState, watchedPorn: value },
      step: 2,
      submitError: null,
    });
  },

  selectUrgeLevelAndSubmit: async (level) => {
    const { formState } = get();
    set({
      formState: { ...formState, urgeLevel: level },
      isSubmitting: true,
      submitError: null,
    });

    try {
      const checkin = await checkinService.processCheckin({
        watchedPorn: formState.watchedPorn,
        urgeLevel: level,
        stressLevel: 3,
        qualityOfLife: 3,
        memo: '',
      });

      await useCheckinStore.getState().addCheckin(checkin);
      await useUserStore.getState().loadUser();
      const today = format(new Date(), 'yyyy-MM-dd');
      await useReflectionStore.getState().markCompleted(today);

      // Stage celebration if user reported staying clean.
      let pendingCelebrationStreak: number | null = null;
      if (formState.watchedPorn === false) {
        const userState = useUserStore.getState();
        const checkinState = useCheckinStore.getState();
        if (userState.user?.streakStartDate) {
          const streak = calculateStreak(
            userState.user.streakStartDate,
            checkinState.checkins,
          );
          if (streak > 0) {
            pendingCelebrationStreak = streak;
          }
        }
      }

      analyticsClient.logEvent('reflection_completed', {
        streak_day: pendingCelebrationStreak ?? 0,
        urge_level: level,
      });
      const fresh = useUserStore.getState().user;
      setRetentionUserProperties(
        fresh?.streakStartDate,
        useCheckinStore.getState().checkins,
      );

      set({ step: 3, isSubmitting: false, pendingCelebrationStreak });
    } catch (e: any) {
      set({
        isSubmitting: false,
        submitError: e?.message || 'submit failed',
      });
    }
  },

  confessRelapseAndClose: async () => {
    set({
      formState: { watchedPorn: true, urgeLevel: 0 },
      isSubmitting: true,
      submitError: null,
    });

    // Capture the streak being broken before processCheckin resets it.
    const userBefore = useUserStore.getState().user;
    const previousStreak = userBefore?.streakStartDate
      ? calculateStreak(userBefore.streakStartDate, useCheckinStore.getState().checkins)
      : 0;

    try {
      const checkin = await checkinService.processCheckin({
        watchedPorn: true,
        urgeLevel: 0,
        stressLevel: 3,
        qualityOfLife: 3,
        memo: '',
      });

      await useCheckinStore.getState().addCheckin(checkin);
      await useUserStore.getState().loadUser();
      const today = format(new Date(), 'yyyy-MM-dd');
      await useReflectionStore.getState().markCompleted(today);

      analyticsClient.logEvent('relapse_recorded', { previous_streak: previousStreak });
      const fresh = useUserStore.getState().user;
      setRetentionUserProperties(
        fresh?.streakStartDate,
        useCheckinStore.getState().checkins,
      );

      set({ visible: false, isSubmitting: false });
      return true;
    } catch (e: any) {
      set({
        isSubmitting: false,
        submitError: e?.message || 'submit failed',
      });
      return false;
    }
  },

  finish: () => {
    set({ visible: false });
  },

  clearPendingCelebration: () => {
    set({ pendingCelebrationStreak: null });
  },

  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));
