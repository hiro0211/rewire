const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: any[]) => mockGet(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

import { useScreenTimeStore } from '../screenTimeStore';

describe('screenTimeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useScreenTimeStore.setState({ enabled: false });
  });

  describe('初期状態', () => {
    it('デフォルトはfalse', () => {
      expect(useScreenTimeStore.getState().enabled).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('trueに変更できる', async () => {
      await useScreenTimeStore.getState().setEnabled(true);

      expect(useScreenTimeStore.getState().enabled).toBe(true);
    });

    it('AsyncStorageのscreenTimeキーに永続化する', async () => {
      mockGet.mockResolvedValueOnce(null);
      await useScreenTimeStore.getState().setEnabled(true);

      expect(mockSet).toHaveBeenCalledWith('screenTime', { enabled: true });
    });

    it('既存のscreenTimeデータをマージして保存する', async () => {
      mockGet.mockResolvedValueOnce({ otherKey: 'keep-me' });
      await useScreenTimeStore.getState().setEnabled(true);

      expect(mockSet).toHaveBeenCalledWith('screenTime', {
        otherKey: 'keep-me',
        enabled: true,
      });
    });
  });

  describe('loadEnabled', () => {
    it('ストレージからenabled状態を読み込む', async () => {
      mockGet.mockResolvedValueOnce({ enabled: true });

      await useScreenTimeStore.getState().loadEnabled();

      expect(useScreenTimeStore.getState().enabled).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('screenTime');
    });

    it('ストレージが空の場合falseのまま', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useScreenTimeStore.getState().loadEnabled();

      expect(useScreenTimeStore.getState().enabled).toBe(false);
    });

    it('ストレージエラー時もfalseのまま', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useScreenTimeStore.getState().loadEnabled();

      expect(useScreenTimeStore.getState().enabled).toBe(false);
    });
  });
});
