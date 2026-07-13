const mockSyncWidgetData = jest.fn().mockResolvedValue(undefined);
jest.mock('../widgetDataSync', () => ({
  syncWidgetData: (...args: any[]) => mockSyncWidgetData(...args),
}));

const mockUserGetState = jest.fn();
jest.mock('@/stores/userStore', () => ({
  useUserStore: { getState: () => mockUserGetState() },
}));

const mockCheckinGetState = jest.fn();
jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: { getState: () => mockCheckinGetState() },
}));

jest.mock('@/lib/stats/statsCalculator', () => ({
  calculateRelapseCount: (checkins: unknown[]) => checkins.length,
}));

import { resyncWidgetFromStores } from '../resyncWidget';

describe('resyncWidgetFromStores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckinGetState.mockReturnValue({ checkins: [{}, {}] });
  });

  it('ユーザーが存在すれば現在のストア状態で syncWidgetData を呼ぶ', async () => {
    mockUserGetState.mockReturnValue({
      user: { streakStartDate: '2026-02-20', goalDays: 90 },
    });

    await resyncWidgetFromStores();

    expect(mockSyncWidgetData).toHaveBeenCalledWith({
      streakStartDate: '2026-02-20',
      goalDays: 90,
      relapseCount: 2,
    });
  });

  it('ユーザーが null のときは何もしない', async () => {
    mockUserGetState.mockReturnValue({ user: null });

    await resyncWidgetFromStores();

    expect(mockSyncWidgetData).not.toHaveBeenCalled();
  });
});
