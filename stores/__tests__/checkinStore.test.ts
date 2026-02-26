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

describe('checkinStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCheckinStore.setState({ checkins: [], todayCheckin: null, isLoading: false });
  });

  describe('loadCheckins', () => {
    it('ストレージからチェックインを読み込む', async () => {
      const checkins = [makeCheckin('2025-01-01'), makeCheckin('2025-01-02')];
      mockGetAll.mockResolvedValueOnce(checkins);

      await useCheckinStore.getState().loadCheckins();

      expect(useCheckinStore.getState().checkins).toEqual(checkins);
      expect(useCheckinStore.getState().isLoading).toBe(false);
    });

    it('今日のチェックインがあればtodayCheckinにセットされる', async () => {
      const todayCheckin = makeCheckin(TODAY);
      mockGetAll.mockResolvedValueOnce([todayCheckin]);

      await useCheckinStore.getState().loadCheckins();

      expect(useCheckinStore.getState().todayCheckin).toEqual(todayCheckin);
    });

    it('今日のチェックインがなければtodayCheckinはnull', async () => {
      mockGetAll.mockResolvedValueOnce([makeCheckin('2025-01-01')]);

      await useCheckinStore.getState().loadCheckins();

      expect(useCheckinStore.getState().todayCheckin).toBeNull();
    });

    it('ストレージエラー時もisLoadingがfalseになる', async () => {
      mockGetAll.mockRejectedValueOnce(new Error('Storage error'));

      await useCheckinStore.getState().loadCheckins();

      expect(useCheckinStore.getState().isLoading).toBe(false);
    });
  });

  describe('addCheckin', () => {
    it('チェックインを追加してストレージに保存する', async () => {
      const checkin = makeCheckin(TODAY);

      await useCheckinStore.getState().addCheckin(checkin);

      expect(useCheckinStore.getState().checkins).toContainEqual(checkin);
      expect(useCheckinStore.getState().todayCheckin).toEqual(checkin);
      expect(mockSave).toHaveBeenCalledWith(checkin);
    });

    it('同日のチェックインは置換される', async () => {
      const first = makeCheckin(TODAY, false);
      const second = { ...makeCheckin(TODAY, true), id: 'second' };

      await useCheckinStore.getState().addCheckin(first);
      await useCheckinStore.getState().addCheckin(second);

      const checkins = useCheckinStore.getState().checkins;
      const todayCheckins = checkins.filter((c) => c.date === TODAY);
      expect(todayCheckins.length).toBe(1);
      expect(todayCheckins[0].id).toBe('second');
    });

    it('異なる日のチェックインは保持される', async () => {
      const yesterday = makeCheckin('2025-01-01');
      useCheckinStore.setState({ checkins: [yesterday] });

      const todayCheckin = makeCheckin(TODAY);
      await useCheckinStore.getState().addCheckin(todayCheckin);

      expect(useCheckinStore.getState().checkins).toHaveLength(2);
    });
  });

  describe('removeTodayCheckin', () => {
    it('今日のチェックインを削除する', async () => {
      const todayCheckin = makeCheckin(TODAY);
      useCheckinStore.setState({
        checkins: [todayCheckin],
        todayCheckin,
      });

      await useCheckinStore.getState().removeTodayCheckin();

      expect(useCheckinStore.getState().checkins).toHaveLength(0);
      expect(useCheckinStore.getState().todayCheckin).toBeNull();
      expect(mockRemove).toHaveBeenCalledWith(TODAY);
    });

    it('他の日のチェックインは残る', async () => {
      const yesterday = makeCheckin('2025-01-01');
      const todayCheckin = makeCheckin(TODAY);
      useCheckinStore.setState({
        checkins: [yesterday, todayCheckin],
        todayCheckin,
      });

      await useCheckinStore.getState().removeTodayCheckin();

      expect(useCheckinStore.getState().checkins).toHaveLength(1);
      expect(useCheckinStore.getState().checkins[0].date).toBe('2025-01-01');
    });
  });

  describe('reset', () => {
    it('すべてのデータをクリアする', () => {
      useCheckinStore.setState({
        checkins: [makeCheckin(TODAY)],
        todayCheckin: makeCheckin(TODAY),
      });

      useCheckinStore.getState().reset();

      expect(useCheckinStore.getState().checkins).toEqual([]);
      expect(useCheckinStore.getState().todayCheckin).toBeNull();
    });
  });
});
