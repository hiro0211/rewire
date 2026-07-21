import AsyncStorage from '@react-native-async-storage/async-storage';

import { daysSinceInstall, ensureInstallDate } from '../installDate';

// Install dates are calendar days in the user's own timezone, so these fixtures
// are built in local time. ISO "Z" literals would silently shift the expected
// day whenever the test machine is not on UTC (this suite runs in JST).
const local = (y: number, m: number, d: number, hour = 0) =>
  new Date(y, m - 1, d, hour);

describe('installDate', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('ensureInstallDate', () => {
    it('初回呼び出しのとき今日の日付を保存して返す', async () => {
      const stored = await ensureInstallDate(null, local(2026, 7, 19, 10));
      expect(stored).toBe('2026-07-19');
    });

    it('2回目以降は最初に保存した日付を返す', async () => {
      await ensureInstallDate(null, local(2026, 7, 1));
      const second = await ensureInstallDate(null, local(2026, 7, 19));
      expect(second).toBe('2026-07-01');
    });

    // Existing users are already installed by the time this ships, so without a
    // seed they would all look like fresh installs and every retention curve
    // would restart from the release date.
    it('未保存のとき既存ユーザーの作成日を初期値に使う', async () => {
      const stored = await ensureInstallDate(
        '2026-03-15T08:30:00.000Z',
        local(2026, 7, 19),
      );
      expect(stored).toBe('2026-03-15');
    });

    it('既に保存済みなら作成日で上書きしない', async () => {
      await ensureInstallDate(null, local(2026, 7, 1));
      const second = await ensureInstallDate(
        '2026-03-15T08:30:00.000Z',
        local(2026, 7, 19),
      );
      expect(second).toBe('2026-07-01');
    });

    it('作成日が不正な文字列のとき今日にフォールバックする', async () => {
      const stored = await ensureInstallDate('not-a-date', local(2026, 7, 19));
      expect(stored).toBe('2026-07-19');
    });
  });

  describe('daysSinceInstall', () => {
    it('未保存のとき null を返す', async () => {
      expect(await daysSinceInstall(local(2026, 7, 19))).toBeNull();
    });

    it('インストール当日は 0 になる', async () => {
      await ensureInstallDate(null, local(2026, 7, 19, 1));
      expect(await daysSinceInstall(local(2026, 7, 19, 23))).toBe(0);
    });

    it('翌日は 1 になる', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      expect(await daysSinceInstall(local(2026, 7, 20))).toBe(1);
    });

    // Whole calendar days, not elapsed 24h blocks: a 23:00 install and a 01:00
    // next-morning open is day 1, which is how retention cohorts are counted.
    it('時刻ではなく暦日で数える', async () => {
      await ensureInstallDate(null, local(2026, 7, 19, 23));
      expect(await daysSinceInstall(local(2026, 7, 20, 1))).toBe(1);
    });

    it('30日後は 30 になる', async () => {
      await ensureInstallDate(null, local(2026, 6, 19));
      expect(await daysSinceInstall(local(2026, 7, 19))).toBe(30);
    });
  });
});
