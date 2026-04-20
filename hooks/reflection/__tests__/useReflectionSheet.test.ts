const mockProcessCheckin = jest.fn();
jest.mock('@/features/checkin/checkinService', () => ({
  checkinService: {
    processCheckin: (...args: any[]) => mockProcessCheckin(...args),
  },
}));

const mockAddCheckin = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: {
    getState: () => ({ addCheckin: mockAddCheckin }),
  },
}));

const mockLoadUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => ({ loadUser: mockLoadUser }),
  },
}));

const mockMarkCompleted = jest.fn().mockResolvedValue(undefined);
jest.mock('@/stores/reflectionStore', () => ({
  useReflectionStore: {
    getState: () => ({ markCompleted: mockMarkCompleted }),
  },
}));

import { useReflectionSheet } from '../useReflectionSheet';

describe('useReflectionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      });

      useReflectionSheet.getState().reset();

      const state = useReflectionSheet.getState();
      expect(state.visible).toBe(false);
      expect(state.step).toBe(1);
      expect(state.formState.watchedPorn).toBeNull();
      expect(state.formState.urgeLevel).toBe(0);
      expect(state.submitError).toBeNull();
    });
  });
});
