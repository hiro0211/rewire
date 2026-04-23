import { create } from 'zustand';
import { format } from 'date-fns/format';
import { checkinService } from '@/features/checkin/checkinService';
import { useCheckinStore } from '@/stores/checkinStore';
import { useUserStore } from '@/stores/userStore';
import { useReflectionStore } from '@/stores/reflectionStore';

export type ReflectionStep = 1 | 2 | 3;

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
}

interface ReflectionSheetActions {
  open: () => void;
  close: () => void;
  selectWatchedPorn: (value: boolean) => void;
  selectUrgeLevelAndSubmit: (level: number) => Promise<void>;
  confessRelapseAndClose: () => Promise<boolean>;
  finish: () => void;
  reset: () => void;
}

const INITIAL_STATE: ReflectionSheetState = {
  visible: false,
  step: 1,
  formState: { watchedPorn: null, urgeLevel: 0 },
  isSubmitting: false,
  submitError: null,
};

export const useReflectionSheet = create<ReflectionSheetState & ReflectionSheetActions>((set, get) => ({
  ...INITIAL_STATE,

  open: () => {
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

      set({ step: 3, isSubmitting: false });
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

  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));
