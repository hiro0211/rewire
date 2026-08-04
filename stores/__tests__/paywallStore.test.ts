import { usePaywallStore } from '@/stores/paywallStore';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockGet = asyncStorageClient.get as jest.MockedFunction<typeof asyncStorageClient.get>;
const mockSet = asyncStorageClient.set as jest.MockedFunction<typeof asyncStorageClient.set>;

describe('paywallStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePaywallStore.setState({ lastShownAt: null, hasHydrated: false });
  });

  it('初期状態では最終表示時刻を持たない', () => {
    expect(usePaywallStore.getState().lastShownAt).toBeNull();
  });

  it('初期状態では hasHydrated は false である', () => {
    expect(usePaywallStore.getState().hasHydrated).toBe(false);
  });

  it('loadLaunchPaywallState で保存済みの最終表示時刻を読み込む', async () => {
    mockGet.mockResolvedValueOnce({ lastShownAt: '2026-08-01T00:00:00.000Z' });
    await usePaywallStore.getState().loadLaunchPaywallState();
    expect(usePaywallStore.getState().lastShownAt).toBe('2026-08-01T00:00:00.000Z');
  });

  it('読み込みに失敗しても hasHydrated は true になる', async () => {
    // ここで止まると brand.tsx の遷移待機が解けず、起動画面から進めなくなる
    mockGet.mockRejectedValueOnce(new Error('boom'));
    await usePaywallStore.getState().loadLaunchPaywallState();
    expect(usePaywallStore.getState().hasHydrated).toBe(true);
  });

  it('markLaunchPaywallShown で最終表示時刻を更新する', async () => {
    await usePaywallStore.getState().markLaunchPaywallShown(new Date('2026-08-04T12:00:00.000Z'));
    expect(usePaywallStore.getState().lastShownAt).toBe('2026-08-04T12:00:00.000Z');
  });

  it('markLaunchPaywallShown は paywall_cooldown キーに永続化する', async () => {
    await usePaywallStore.getState().markLaunchPaywallShown(new Date('2026-08-04T12:00:00.000Z'));
    expect(mockSet).toHaveBeenCalledWith('paywall_cooldown', {
      lastShownAt: '2026-08-04T12:00:00.000Z',
    });
  });

  it('永続化に失敗してもメモリ上の状態は維持する', async () => {
    mockSet.mockRejectedValueOnce(new Error('boom'));
    await usePaywallStore.getState().markLaunchPaywallShown(new Date('2026-08-04T12:00:00.000Z'));
    expect(usePaywallStore.getState().lastShownAt).toBe('2026-08-04T12:00:00.000Z');
  });
});
