const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { useReflectionStore } from '../reflectionStore';

describe('reflectionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useReflectionStore.setState({ lastReflectionDate: null });
  });

  describe('初期状態', () => {
    it('lastReflectionDate は null', () => {
      expect(useReflectionStore.getState().lastReflectionDate).toBeNull();
    });
  });

  describe('markCompleted', () => {
    it('指定日を lastReflectionDate に保存する', async () => {
      await useReflectionStore.getState().markCompleted('2026-04-19');

      expect(useReflectionStore.getState().lastReflectionDate).toBe('2026-04-19');
    });

    it('AsyncStorage の settings キーにマージ保存する', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useReflectionStore.getState().markCompleted('2026-04-19');

      expect(mockSet).toHaveBeenCalledWith('settings', {
        lastReflectionDate: '2026-04-19',
      });
    });

    it('既存 settings をマージして保存する', async () => {
      mockGet.mockResolvedValueOnce({ themePreference: 'dark' });

      await useReflectionStore.getState().markCompleted('2026-04-19');

      expect(mockSet).toHaveBeenCalledWith('settings', {
        themePreference: 'dark',
        lastReflectionDate: '2026-04-19',
      });
    });
  });

  describe('isTodayCompleted', () => {
    it('lastReflectionDate が引数日付と一致すれば true', () => {
      useReflectionStore.setState({ lastReflectionDate: '2026-04-19' });

      expect(useReflectionStore.getState().isTodayCompleted('2026-04-19')).toBe(true);
    });

    it('日付が異なれば false', () => {
      useReflectionStore.setState({ lastReflectionDate: '2026-04-18' });

      expect(useReflectionStore.getState().isTodayCompleted('2026-04-19')).toBe(false);
    });

    it('lastReflectionDate が null なら false', () => {
      useReflectionStore.setState({ lastReflectionDate: null });

      expect(useReflectionStore.getState().isTodayCompleted('2026-04-19')).toBe(false);
    });
  });

  describe('loadReflectionState', () => {
    it('ストレージから lastReflectionDate を読み込む', async () => {
      mockGet.mockResolvedValueOnce({ lastReflectionDate: '2026-04-18' });

      await useReflectionStore.getState().loadReflectionState();

      expect(useReflectionStore.getState().lastReflectionDate).toBe('2026-04-18');
      expect(mockGet).toHaveBeenCalledWith('settings');
    });

    it('ストレージが空なら null のまま', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useReflectionStore.getState().loadReflectionState();

      expect(useReflectionStore.getState().lastReflectionDate).toBeNull();
    });

    it('ストレージエラー時も null のまま', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useReflectionStore.getState().loadReflectionState();

      expect(useReflectionStore.getState().lastReflectionDate).toBeNull();
    });
  });

  describe('reset', () => {
    it('lastReflectionDate を null に戻す', () => {
      useReflectionStore.setState({ lastReflectionDate: '2026-04-19' });

      useReflectionStore.getState().reset();

      expect(useReflectionStore.getState().lastReflectionDate).toBeNull();
    });
  });
});
