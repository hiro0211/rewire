const mockSave = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockClear = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    save: (...args: any[]) => mockSave(...args),
    get: () => mockGet(),
    update: (...args: any[]) => mockUpdate(...args),
    clear: () => mockClear(),
  },
}));

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    clearAll: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: { getState: () => ({ reset: jest.fn() }) },
}));

jest.mock('@/stores/breathStore', () => ({
  useBreathStore: { getState: () => ({ reset: jest.fn() }) },
}));

import { useUserStore } from '../userStore';

const TEST_USER = {
  id: 'test-id',
  nickname: 'TestUser',
  goalDays: 30,
  streakStartDate: '2025-01-01',
  isPro: false,
  notifyTime: '22:00',
  notifyEnabled: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  consentGivenAt: '2025-01-01T00:00:00.000Z',
  ageVerifiedAt: null,
};

describe('userStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: null, isLoading: false, hasHydrated: false });
  });

  describe('setUser', () => {
    it('ユーザーをstateに保存し、ストレージにも保存する', async () => {
      await useUserStore.getState().setUser(TEST_USER);

      expect(useUserStore.getState().user).toEqual(TEST_USER);
      expect(mockSave).toHaveBeenCalledWith(TEST_USER);
    });

    it('ストレージ保存完了を待ってからresolveする', async () => {
      let resolved = false;
      mockSave.mockImplementation(() => new Promise(r => setTimeout(() => { resolved = true; r(undefined); }, 50)));

      const promise = useUserStore.getState().setUser(TEST_USER);
      expect(resolved).toBe(false);
      await promise;
      expect(resolved).toBe(true);
    });

    it('ストレージ保存が失敗した場合エラーがthrowされる', async () => {
      mockSave.mockRejectedValueOnce(new Error('Storage error'));

      await expect(useUserStore.getState().setUser(TEST_USER)).rejects.toThrow('Storage error');
    });
  });

  describe('updateUser', () => {
    it('既存ユーザーの部分更新ができる', async () => {
      useUserStore.setState({ user: TEST_USER });

      await useUserStore.getState().updateUser({ goalDays: 90 });

      expect(useUserStore.getState().user?.goalDays).toBe(90);
      expect(mockSave).toHaveBeenCalledWith({ ...TEST_USER, goalDays: 90 });
    });

    it('ユーザーがnullの場合は何もしない', async () => {
      useUserStore.setState({ user: null });

      await useUserStore.getState().updateUser({ goalDays: 90 });

      expect(mockSave).not.toHaveBeenCalled();
    });

    it('isPro更新が正しく保存される', async () => {
      useUserStore.setState({ user: TEST_USER });

      await useUserStore.getState().updateUser({ isPro: true });

      expect(useUserStore.getState().user?.isPro).toBe(true);
    });
  });

  describe('loadUser', () => {
    it('ストレージからユーザーを読み込む', async () => {
      mockGet.mockResolvedValueOnce(TEST_USER);

      await useUserStore.getState().loadUser();

      expect(useUserStore.getState().user).toEqual(TEST_USER);
      expect(useUserStore.getState().hasHydrated).toBe(true);
      expect(useUserStore.getState().isLoading).toBe(false);
    });

    it('ストレージが空の場合userはnull', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useUserStore.getState().loadUser();

      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().hasHydrated).toBe(true);
    });

    it('ストレージエラー時もhasHydratedはtrueでisLoadingはfalse', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useUserStore.getState().loadUser();

      expect(useUserStore.getState().hasHydrated).toBe(true);
      expect(useUserStore.getState().isLoading).toBe(false);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('reset', () => {
    it('ユーザーをnullにしてストレージをクリアする', async () => {
      useUserStore.setState({ user: TEST_USER });

      await useUserStore.getState().reset();

      expect(useUserStore.getState().user).toBeNull();
    });
  });
});
