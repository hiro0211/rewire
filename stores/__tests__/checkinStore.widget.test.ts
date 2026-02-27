const mockGetAll = jest.fn();
const mockSave = jest.fn().mockResolvedValue(undefined);
const mockRemove = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/storage/checkinStorage', () => ({
  checkinStorage: {
    getAll: () => mockGetAll(),
    save: (...args: any[]) => mockSave(...args),
    remove: (...args: any[]) => mockRemove(...args),
  },
}));

const mockSyncWidgetData = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/widget/widgetDataSync', () => ({
  syncWidgetData: (...args: any[]) => mockSyncWidgetData(...args),
  clearWidgetData: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => ({
      user: { streakStartDate: '2026-01-01', goalDays: 30 },
    }),
  },
}));

import { useCheckinStore } from '../checkinStore';
import type { DailyCheckin } from '@/types/models';
import { format } from 'date-fns';

const makeCheckin = (date: string, watchedPorn = false): DailyCheckin => ({
  id: `id-${date}`,
  userId: 'user-1',
  date,
  watchedPorn,
  urgeLevel: 2,
  stressLevel: 2,
  qualityOfLife: 3,
  memo: '',
  createdAt: `${date}T12:00:00.000Z`,
});

const TODAY = format(new Date(), 'yyyy-MM-dd');

describe('checkinStore widget sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCheckinStore.setState({ checkins: [], todayCheckin: null, isLoading: false });
  });

  it('addCheckin(watchedPorn=true) → syncWidgetData(relapseCount=1)', async () => {
    const checkin = makeCheckin(TODAY, true);
    await useCheckinStore.getState().addCheckin(checkin);
    expect(mockSyncWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ relapseCount: 1 })
    );
  });

  it('addCheckin(watchedPorn=false) → syncWidgetData(relapseCount=0)', async () => {
    const checkin = makeCheckin(TODAY, false);
    await useCheckinStore.getState().addCheckin(checkin);
    expect(mockSyncWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ relapseCount: 0 })
    );
  });

  it('removeTodayCheckin → syncWidgetData 呼出', async () => {
    const checkin = makeCheckin(TODAY, true);
    useCheckinStore.setState({ checkins: [checkin], todayCheckin: checkin });
    await useCheckinStore.getState().removeTodayCheckin();
    expect(mockSyncWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ relapseCount: 0 })
    );
  });
});
