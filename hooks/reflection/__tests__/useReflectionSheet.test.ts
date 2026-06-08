const mockProcessCheckin = jest.fn();
jest.mock('@/features/checkin/checkinService', () => ({
  checkinService: {
    processCheckin: (...args: any[]) => mockProcessCheckin(...args),
  },
}));

const mockAddCheckin = jest.fn().mockResolvedValue(undefined);

const mockLoadUser = jest.fn().mockResolvedValue(undefined);
let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => ({ loadUser: mockLoadUser, user: mockUser }),
  },
}));

let mockCheckins: any[] = [];
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: {
    getState: () => ({ addCheckin: mockAddCheckin, checkins: mockCheckins }),
  },
}));

const mockMarkCompleted = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/reflectionStore', () => ({
  useReflectionStore: {
    getState: () => ({ markCompleted: mockMarkCompleted }),
  },
}));

const mockLogEvent = jest.fn();
const mockSetUserProperty = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
    setUserProperty: (...args: any[]) => mockSetUserProperty(...args),
  },
}));

import { useReflectionSheet } from '../useReflectionSheet';

describe('useReflectionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockCheckins = [];
    mockProcessCheckin.mockResolvedValue({
      id: 'abc',
      date: '2026-04-19',
      watchedPorn: false,
      urgeLevel: 2,
      stressLevel: 3,
      qualityOfLife: 3,
      memo: '',
    });
    useReflectionSheet.getState().reset();
  });

  describe('初期状態', () => {
    it('visible=false, step=1, formState は初期値', () => {
      const state = useReflectionSheet.getState();

      expect(state.visible).toBe(false);
      expect(state.step).toBe(1);
      expect(state.formState.watchedPorn).toBeNull();
      expect(state.formState.urgeLevel).toBe(0);
      expect(state.submitError).toBeNull();
      expect(state.isSubmitting).toBe(false);
    });
  });

  describe('open', () => {
    it('visible=true, step=1 にリセットしシートを開く', () => {
      useReflectionSheet.setState({ step: 3, formState: { watchedPorn: true, urgeLevel: 4 } });

      useReflectionSheet.getState().open();

      const state = useReflectionSheet.getState();
      expect(state.visible).toBe(true);
      expect(state.step).toBe(1);
      expect(state.formState.watchedPorn).toBeNull();
      expect(state.formState.urgeLevel).toBe(0);
    });

    it('reflection_opened を source 付きで送信する', () => {
      useReflectionSheet.getState().open('notification');

      expect(mockLogEvent).toHaveBeenCalledWith('reflection_opened', {
        source: 'notification',
      });
    });

    it('source 省略時は manual で送信する', () => {
      useReflectionSheet.getState().open();

      expect(mockLogEvent).toHaveBeenCalledWith('reflection_opened', {
        source: 'manual',
      });
    });
  });

  describe('close', () => {
    it('visible=false にする', () => {
      useReflectionSheet.setState({ visible: true });

      useReflectionSheet.getState().close();

      expect(useReflectionSheet.getState().visible).toBe(false);
    });
  });

  describe('selectWatchedPorn', () => {
    it('watchedPorn を保存し step=2 へ進む', () => {
      useReflectionSheet.getState().open();

      useReflectionSheet.getState().selectWatchedPorn(false);

      const state = useReflectionSheet.getState();
      expect(state.formState.watchedPorn).toBe(false);
      expect(state.step).toBe(2);
    });
  });

  describe('selectUrgeLevelAndSubmit', () => {
    beforeEach(() => {
      useReflectionSheet.getState().open();
      useReflectionSheet.getState().selectWatchedPorn(false);
    });

    it('urgeLevel を保存し checkinService.processCheckin を呼ぶ', async () => {
      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(mockProcessCheckin).toHaveBeenCalledWith({
        watchedPorn: false,
        urgeLevel: 2,
        stressLevel: 3,
        qualityOfLife: 3,
        memo: '',
      });
    });

    it('成功時に addCheckin, loadUser, markCompleted(today) を呼び step=3 へ進む', async () => {
      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(mockAddCheckin).toHaveBeenCalled();
      expect(mockLoadUser).toHaveBeenCalled();
      expect(mockMarkCompleted).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      expect(useReflectionSheet.getState().step).toBe(3);
    });

    it('失敗時は step=2 のまま submitError を格納する', async () => {
      mockProcessCheckin.mockRejectedValueOnce(new Error('validation failed'));

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      const state = useReflectionSheet.getState();
      expect(state.step).toBe(2);
      expect(state.submitError).toBe('validation failed');
      expect(mockMarkCompleted).not.toHaveBeenCalled();
    });

    it('成功時に reflection_completed を streak_day/urge_level 付きで送信する', async () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      mockUser = { streakStartDate: tenDaysAgo, goalDays: 30 };

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(mockLogEvent).toHaveBeenCalledWith('reflection_completed', {
        streak_day: 10,
        urge_level: 2,
      });
    });

    it('失敗時は reflection_completed を送信しない', async () => {
      mockProcessCheckin.mockRejectedValueOnce(new Error('boom'));

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(mockLogEvent).not.toHaveBeenCalledWith(
        'reflection_completed',
        expect.anything(),
      );
    });

    it('成功時に retention user properties を設定する', async () => {
      mockUser = { streakStartDate: new Date().toISOString(), goalDays: 30 };

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(1);

      expect(mockSetUserProperty).toHaveBeenCalledWith('current_streak', expect.any(String));
      expect(mockSetUserProperty).toHaveBeenCalledWith('relapse_count', expect.any(String));
    });
  });

  describe('confessRelapseAndClose', () => {
    beforeEach(() => {
      useReflectionSheet.getState().open();
    });

    it('watchedPorn=true, urgeLevel=0 で checkinService.processCheckin を呼ぶ', async () => {
      await useReflectionSheet.getState().confessRelapseAndClose();

      expect(mockProcessCheckin).toHaveBeenCalledWith({
        watchedPorn: true,
        urgeLevel: 0,
        stressLevel: 3,
        qualityOfLife: 3,
        memo: '',
      });
    });

    it('成功時に addCheckin, loadUser, markCompleted(today) を呼び visible=false にする', async () => {
      await useReflectionSheet.getState().confessRelapseAndClose();

      expect(mockAddCheckin).toHaveBeenCalled();
      expect(mockLoadUser).toHaveBeenCalled();
      expect(mockMarkCompleted).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      expect(useReflectionSheet.getState().visible).toBe(false);
      expect(useReflectionSheet.getState().isSubmitting).toBe(false);
    });

    it('成功時は true を返す', async () => {
      const result = await useReflectionSheet.getState().confessRelapseAndClose();

      expect(result).toBe(true);
    });

    it('失敗時は submitError を格納し visible は true のまま、false を返す', async () => {
      mockProcessCheckin.mockRejectedValueOnce(new Error('network down'));

      const result = await useReflectionSheet.getState().confessRelapseAndClose();

      const state = useReflectionSheet.getState();
      expect(state.visible).toBe(true);
      expect(state.submitError).toBe('network down');
      expect(state.isSubmitting).toBe(false);
      expect(mockMarkCompleted).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('成功時に relapse_recorded を previous_streak 付きで送信する', async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      mockUser = { streakStartDate: sevenDaysAgo, goalDays: 30 };

      await useReflectionSheet.getState().confessRelapseAndClose();

      expect(mockLogEvent).toHaveBeenCalledWith('relapse_recorded', {
        previous_streak: 7,
      });
    });

    it('失敗時は relapse_recorded を送信しない', async () => {
      mockProcessCheckin.mockRejectedValueOnce(new Error('down'));
      mockUser = { streakStartDate: new Date().toISOString(), goalDays: 30 };

      await useReflectionSheet.getState().confessRelapseAndClose();

      expect(mockLogEvent).not.toHaveBeenCalledWith(
        'relapse_recorded',
        expect.anything(),
      );
    });
  });

  describe('finish', () => {
    it('visible=false にして close する', () => {
      useReflectionSheet.setState({ visible: true, step: 3 });

      useReflectionSheet.getState().finish();

      expect(useReflectionSheet.getState().visible).toBe(false);
    });
  });

  describe('reset', () => {
    it('全ての state を初期値に戻す', () => {
      useReflectionSheet.setState({
        visible: true,
        step: 3,
        formState: { watchedPorn: true, urgeLevel: 4 },
        submitError: 'error',
        pendingCelebrationStreak: 5,
      });

      useReflectionSheet.getState().reset();

      const state = useReflectionSheet.getState();
      expect(state.visible).toBe(false);
      expect(state.step).toBe(1);
      expect(state.formState.watchedPorn).toBeNull();
      expect(state.formState.urgeLevel).toBe(0);
      expect(state.submitError).toBeNull();
      expect(state.pendingCelebrationStreak).toBeNull();
    });
  });

  describe('pendingCelebrationStreak', () => {
    it('初期値は null', () => {
      expect(useReflectionSheet.getState().pendingCelebrationStreak).toBeNull();
    });

    it('watchedPorn=false で submit 成功時、最新ストリーク値が pendingCelebrationStreak にセットされる', async () => {
      useReflectionSheet.getState().open();
      useReflectionSheet.getState().selectWatchedPorn(false);
      // streakStartDate を 10 日前 (= diff 10) に設定
      const tenDaysAgoMs = Date.now() - 10 * 24 * 60 * 60 * 1000;
      mockUser = { streakStartDate: new Date(tenDaysAgoMs).toISOString(), goalDays: 30 };

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      const state = useReflectionSheet.getState();
      expect(state.pendingCelebrationStreak).toBe(10);
    });

    it('watchedPorn=true（relapse）の場合は pendingCelebrationStreak をセットしない', async () => {
      useReflectionSheet.getState().open();
      useReflectionSheet.getState().selectWatchedPorn(true);
      mockUser = { streakStartDate: new Date().toISOString(), goalDays: 30 };

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(useReflectionSheet.getState().pendingCelebrationStreak).toBeNull();
    });

    it('clearPendingCelebration() で null に戻る', () => {
      useReflectionSheet.setState({ pendingCelebrationStreak: 10 });

      useReflectionSheet.getState().clearPendingCelebration();

      expect(useReflectionSheet.getState().pendingCelebrationStreak).toBeNull();
    });

    it('streakStartDate がない場合は pendingCelebrationStreak をセットしない', async () => {
      useReflectionSheet.getState().open();
      useReflectionSheet.getState().selectWatchedPorn(false);
      mockUser = { goalDays: 30 };

      await useReflectionSheet.getState().selectUrgeLevelAndSubmit(2);

      expect(useReflectionSheet.getState().pendingCelebrationStreak).toBeNull();
    });
  });
});
