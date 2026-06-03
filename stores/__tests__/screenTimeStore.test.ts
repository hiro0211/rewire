const mockGet = jest.fn();
const mockSet = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

import { useScreenTimeStore } from '../screenTimeStore';

const RESET_STATE = {
  enabled: false,
  selectionToken: null,
  selectionApplicationCount: 0,
  lastShieldedAt: null,
  lastClearedAt: null,
  removalLocked: false,
  lastRemovalLockedAt: null,
};

describe('screenTimeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useScreenTimeStore.setState(RESET_STATE);
  });

  describe('initial state', () => {
    it('全てデフォルト値', () => {
      const s = useScreenTimeStore.getState();
      expect(s.enabled).toBe(false);
      expect(s.selectionToken).toBeNull();
      expect(s.selectionApplicationCount).toBe(0);
      expect(s.lastShieldedAt).toBeNull();
      expect(s.lastClearedAt).toBeNull();
    });
  });

  describe('setSelection', () => {
    it('tokenとapplicationCountを保存しAsyncStorageへ永続化する', async () => {
      await useScreenTimeStore.getState().setSelection('tok-base64', 3);

      const s = useScreenTimeStore.getState();
      expect(s.selectionToken).toBe('tok-base64');
      expect(s.selectionApplicationCount).toBe(3);
      expect(mockSet).toHaveBeenCalledWith(
        'screenTime',
        expect.objectContaining({
          selectionToken: 'tok-base64',
          selectionApplicationCount: 3,
        }),
      );
    });
  });

  describe('clearSelection', () => {
    it('tokenとapplicationCountをリセットする', async () => {
      useScreenTimeStore.setState({
        selectionToken: 'tok',
        selectionApplicationCount: 5,
      });

      await useScreenTimeStore.getState().clearSelection();

      const s = useScreenTimeStore.getState();
      expect(s.selectionToken).toBeNull();
      expect(s.selectionApplicationCount).toBe(0);
    });
  });

  describe('markShielded', () => {
    it('enabled=trueにしlastShieldedAtを現在時刻に更新', async () => {
      const before = Date.now();

      await useScreenTimeStore.getState().markShielded();

      const s = useScreenTimeStore.getState();
      expect(s.enabled).toBe(true);
      expect(s.lastShieldedAt).toBeGreaterThanOrEqual(before);
      expect(mockSet).toHaveBeenCalledWith(
        'screenTime',
        expect.objectContaining({ enabled: true }),
      );
    });
  });

  describe('markCleared', () => {
    it('enabled=falseにしlastClearedAtを現在時刻に更新', async () => {
      useScreenTimeStore.setState({ enabled: true });
      const before = Date.now();

      await useScreenTimeStore.getState().markCleared();

      const s = useScreenTimeStore.getState();
      expect(s.enabled).toBe(false);
      expect(s.lastClearedAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('markRemovalLocked / markRemovalUnlocked', () => {
    it('lockedに切り替えlastRemovalLockedAtを記録する', async () => {
      const before = Date.now();

      await useScreenTimeStore.getState().markRemovalLocked();

      const s = useScreenTimeStore.getState();
      expect(s.removalLocked).toBe(true);
      expect(s.lastRemovalLockedAt).toBeGreaterThanOrEqual(before);
    });

    it('unlockedで removalLocked=false に戻す（lastRemovalLockedAt は保持）', async () => {
      await useScreenTimeStore.getState().markRemovalLocked();
      const lockedAt = useScreenTimeStore.getState().lastRemovalLockedAt;

      await useScreenTimeStore.getState().markRemovalUnlocked();

      const s = useScreenTimeStore.getState();
      expect(s.removalLocked).toBe(false);
      expect(s.lastRemovalLockedAt).toBe(lockedAt);
    });
  });

  describe('loadFromStorage', () => {
    it('保存済みデータを復元する', async () => {
      mockGet.mockResolvedValueOnce({
        enabled: true,
        selectionToken: 'tok',
        selectionApplicationCount: 4,
        lastShieldedAt: 1700000000000,
        lastClearedAt: 1700000001000,
        removalLocked: true,
        lastRemovalLockedAt: 1700000002000,
      });

      await useScreenTimeStore.getState().loadFromStorage();

      const s = useScreenTimeStore.getState();
      expect(s.enabled).toBe(true);
      expect(s.selectionToken).toBe('tok');
      expect(s.selectionApplicationCount).toBe(4);
      expect(s.lastShieldedAt).toBe(1700000000000);
      expect(s.lastClearedAt).toBe(1700000001000);
      expect(s.removalLocked).toBe(true);
      expect(s.lastRemovalLockedAt).toBe(1700000002000);
    });

    it('ストレージ空ならデフォルトのまま', async () => {
      mockGet.mockResolvedValueOnce(null);

      await useScreenTimeStore.getState().loadFromStorage();

      expect(useScreenTimeStore.getState().enabled).toBe(false);
    });

    it('ストレージエラー時はデフォルト維持', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      await useScreenTimeStore.getState().loadFromStorage();

      expect(useScreenTimeStore.getState().enabled).toBe(false);
    });
  });
});
