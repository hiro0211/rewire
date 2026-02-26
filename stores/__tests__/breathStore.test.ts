const mockGetAll = jest.fn();
const mockStorageSave = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/breathSessionStorage', () => ({
  breathSessionStorage: {
    getAll: (...args: any[]) => mockGetAll(...args),
    save: (...args: any[]) => mockStorageSave(...args),
  },
}));

import { useBreathStore } from '../breathStore';

const session1 = { id: 's1', userId: 'u1', duration: 36000, cycles: 3, createdAt: '2026-02-26T10:00:00Z' };
const session2 = { id: 's2', userId: 'u1', duration: 36000, cycles: 3, createdAt: '2026-02-26T11:00:00Z' };

describe('breathStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBreathStore.setState({ sessions: [], totalSessions: 0 });
  });

  describe('loadSessions', () => {
    it('ストレージからセッションを読み込む', async () => {
      mockGetAll.mockResolvedValue([session1, session2]);
      await useBreathStore.getState().loadSessions();
      expect(useBreathStore.getState().sessions).toEqual([session1, session2]);
      expect(useBreathStore.getState().totalSessions).toBe(2);
    });

    it('エラー時にクラッシュしない', async () => {
      mockGetAll.mockRejectedValue(new Error('Storage error'));
      await useBreathStore.getState().loadSessions();
      expect(useBreathStore.getState().sessions).toEqual([]);
    });
  });

  describe('addSession', () => {
    it('セッションを追加してtotalSessionsを更新する', async () => {
      await useBreathStore.getState().addSession(session1 as any);
      expect(useBreathStore.getState().sessions).toEqual([session1]);
      expect(useBreathStore.getState().totalSessions).toBe(1);
    });

    it('ストレージに保存する', async () => {
      await useBreathStore.getState().addSession(session1 as any);
      expect(mockStorageSave).toHaveBeenCalledWith(session1);
    });
  });

  describe('reset', () => {
    it('全データをクリアする', () => {
      useBreathStore.setState({ sessions: [session1 as any], totalSessions: 1 });
      useBreathStore.getState().reset();
      expect(useBreathStore.getState().sessions).toEqual([]);
      expect(useBreathStore.getState().totalSessions).toBe(0);
    });
  });
});
