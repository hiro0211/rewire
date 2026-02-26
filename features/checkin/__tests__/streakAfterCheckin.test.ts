import { checkinService } from '../checkinService';

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

const mockUpdate = jest.fn();
const mockGetByDate = jest.fn();
const mockStoredUser: { current: any } = { current: null };

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: () => Promise.resolve(mockStoredUser.current),
    save: jest.fn(),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

jest.mock('@/lib/storage/checkinStorage', () => ({
  checkinStorage: {
    getByDate: (...args: any[]) => mockGetByDate(...args),
    save: jest.fn(),
  },
}));

describe('streakAfterCheckin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredUser.current = {
      id: 'user-1',
      streakStartDate: '2026-02-20T10:00:00.000Z',
      previousStreakStartDate: null,
    };
    mockGetByDate.mockResolvedValue(null);
  });

  it('relapse時→streakStartDateがISO日時文字列にリセットされる', async () => {
    await checkinService.processCheckin({
      watchedPorn: true,
      urgeLevel: 2,
      stressLevel: 2,
      qualityOfLife: 3,
      memo: '',
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        previousStreakStartDate: '2026-02-20T10:00:00.000Z',
      })
    );

    const call = mockUpdate.mock.calls[0][0];
    // streakStartDateはISO文字列で、Tを含む
    expect(call.streakStartDate).toContain('T');
    expect(call.streakStartDate).toContain('Z');
  });

  it('clean時→streakStartDate変更なし', async () => {
    await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 1,
      stressLevel: 1,
      qualityOfLife: 4,
      memo: '',
    });

    // streakStartDateが既に設定されていて、今日のチェックインがrelapse以外なら更新しない
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('streakStartDateがnullでclean時→新たにISO日時が設定される', async () => {
    mockStoredUser.current = { id: 'user-1', streakStartDate: null, previousStreakStartDate: null };

    await checkinService.processCheckin({
      watchedPorn: false,
      urgeLevel: 0,
      stressLevel: 0,
      qualityOfLife: 5,
      memo: '',
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const call = mockUpdate.mock.calls[0][0];
    expect(call.streakStartDate).toContain('T');
  });
});
