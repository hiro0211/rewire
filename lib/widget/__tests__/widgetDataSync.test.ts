const mockSyncData = jest.fn().mockResolvedValue(undefined);
const mockReloadTimelines = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../modules/expo-widget-sync/src', () => ({
  __esModule: true,
  default: {
    syncData: (...args: any[]) => mockSyncData(...args),
    reloadTimelines: () => mockReloadTimelines(),
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { syncWidgetData, clearWidgetData } from '../widgetDataSync';

describe('syncWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('native syncData にJSON文字列を渡す', async () => {
    await syncWidgetData({
      streakStartDate: '2026-02-20T00:00:00Z',
      goalDays: 90,
      relapseCount: 3,
    });
    expect(mockSyncData).toHaveBeenCalledTimes(1);
    const json = JSON.parse(mockSyncData.mock.calls[0][0]);
    expect(json.streakStartDate).toBe('2026-02-20T00:00:00Z');
    expect(json.goalDays).toBe(90);
    expect(json.relapseCount).toBe(3);
  });

  it('syncData 後に reloadTimelines を呼ぶ', async () => {
    await syncWidgetData({
      streakStartDate: '2026-02-20',
      goalDays: 30,
      relapseCount: 0,
    });
    expect(mockReloadTimelines).toHaveBeenCalledTimes(1);
    const syncOrder = mockSyncData.mock.invocationCallOrder[0];
    const reloadOrder = mockReloadTimelines.mock.invocationCallOrder[0];
    expect(reloadOrder).toBeGreaterThan(syncOrder);
  });

  it('null streakStartDate を正しく渡す', async () => {
    await syncWidgetData({
      streakStartDate: null,
      goalDays: 30,
      relapseCount: 0,
    });
    const json = JSON.parse(mockSyncData.mock.calls[0][0]);
    expect(json.streakStartDate).toBeNull();
  });

  it('relapseCount=0 を正しく渡す', async () => {
    await syncWidgetData({
      streakStartDate: '2026-02-20',
      goalDays: 30,
      relapseCount: 0,
    });
    const json = JSON.parse(mockSyncData.mock.calls[0][0]);
    expect(json.relapseCount).toBe(0);
  });

  it('native module がthrow → 例外伝播しない', async () => {
    mockSyncData.mockRejectedValueOnce(new Error('Native error'));
    await expect(
      syncWidgetData({
        streakStartDate: '2026-02-20',
        goalDays: 30,
        relapseCount: 0,
      })
    ).resolves.toBeUndefined();
  });

  it('reloadTimelines がthrow → 例外伝播しない', async () => {
    mockReloadTimelines.mockRejectedValueOnce(new Error('Reload error'));
    await expect(
      syncWidgetData({
        streakStartDate: '2026-02-20',
        goalDays: 30,
        relapseCount: 0,
      })
    ).resolves.toBeUndefined();
  });

  it('エラー時 console.error に出力', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    mockSyncData.mockRejectedValueOnce(new Error('fail'));
    await syncWidgetData({
      streakStartDate: '2026-02-20',
      goalDays: 30,
      relapseCount: 0,
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[WidgetSync]'),
      expect.any(Error)
    );
    spy.mockRestore();
  });

  it('syncData の JSON に updatedAt が含まれる', async () => {
    await syncWidgetData({
      streakStartDate: '2026-02-20',
      goalDays: 30,
      relapseCount: 0,
    });
    const json = JSON.parse(mockSyncData.mock.calls[0][0]);
    expect(json.updatedAt).toBeDefined();
    expect(typeof json.updatedAt).toBe('string');
  });
});

describe('clearWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('null/0 値で sync', async () => {
    await clearWidgetData();
    expect(mockSyncData).toHaveBeenCalledTimes(1);
    const json = JSON.parse(mockSyncData.mock.calls[0][0]);
    expect(json.streakStartDate).toBeNull();
    expect(json.goalDays).toBe(0);
    expect(json.relapseCount).toBe(0);
  });
});

describe('syncWidgetData when native module unavailable', () => {
  it('native module が null → 例外なし', async () => {
    jest.resetModules();
    jest.doMock('../../../modules/expo-widget-sync/src', () => ({
      __esModule: true,
      default: null,
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    const { syncWidgetData: syncNoMod } = require('../widgetDataSync');
    await expect(
      syncNoMod({ streakStartDate: null, goalDays: 30, relapseCount: 0 })
    ).resolves.toBeUndefined();
  });

  it('native module が undefined → 例外なし', async () => {
    jest.resetModules();
    jest.doMock('../../../modules/expo-widget-sync/src', () => ({
      __esModule: true,
      default: undefined,
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    const { syncWidgetData: syncNoMod } = require('../widgetDataSync');
    await expect(
      syncNoMod({ streakStartDate: null, goalDays: 30, relapseCount: 0 })
    ).resolves.toBeUndefined();
  });
});
