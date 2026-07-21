import AsyncStorage from '@react-native-async-storage/async-storage';

import { analyticsClient } from '../analyticsClient';
import { getActivationDay, isActivated, trackActivation } from '../activation';
import { ensureInstallDate } from '../installDate';

jest.mock('../analyticsClient', () => ({
  analyticsClient: {
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
  },
}));

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('activation', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('trackActivation', () => {
    it('初回は activation_reached を発火する', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 19));

      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'activation_reached',
        expect.objectContaining({ path: 'sos' }),
      );
    });

    it('インストールからの日数をパラメータに含める', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 22));

      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'activation_reached',
        expect.objectContaining({ days_since_install: 3 }),
      );
    });

    // The whole point of activation is "the first time value landed". Firing it
    // on every breathing session would make the metric a usage counter and
    // destroy the denominator for 真のリテンション.
    it('2回目以降は発火しない', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 19));
      (analyticsClient.logEvent as jest.Mock).mockClear();

      await trackActivation('quick_action', local(2026, 7, 20));

      expect(analyticsClient.logEvent).not.toHaveBeenCalled();
    });

    it('発火時にユーザープロパティ is_activated を立てる', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 19));

      expect(analyticsClient.setUserProperty).toHaveBeenCalledWith('is_activated', 'true');
    });

    it('発火時にユーザープロパティ activation_day を記録する', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 24));

      expect(analyticsClient.setUserProperty).toHaveBeenCalledWith('activation_day', '5');
    });

    // A user who installed before this shipped has no stored install date on
    // their first launch; activation must still be recorded, just without a day.
    it('インストール日が未保存でも発火はする', async () => {
      await trackActivation('sos', local(2026, 7, 19));

      expect(analyticsClient.logEvent).toHaveBeenCalledWith(
        'activation_reached',
        expect.objectContaining({ path: 'sos' }),
      );
    });
  });

  describe('isActivated / getActivationDay', () => {
    it('発火前は false を返す', async () => {
      expect(await isActivated()).toBe(false);
    });

    it('発火後は true を返す', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 19));
      expect(await isActivated()).toBe(true);
    });

    it('発火前の activation_day は null を返す', async () => {
      expect(await getActivationDay()).toBeNull();
    });

    it('発火後は発火時点の日数を返す', async () => {
      await ensureInstallDate(null, local(2026, 7, 19));
      await trackActivation('sos', local(2026, 7, 26));
      expect(await getActivationDay()).toBe(7);
    });
  });
});
