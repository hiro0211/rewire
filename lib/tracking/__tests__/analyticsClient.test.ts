import { logger } from '@/lib/logger';

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

import { analyticsClient } from '../analyticsClient';

describe('analyticsClient (no-op)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('エラーを投げずに完了する', async () => {
      await expect(
        analyticsClient.logEvent('test_event', { key: 'value' }),
      ).resolves.toBeUndefined();
    });

    it('__DEV__ 時に logger.debug を呼ぶ', async () => {
      await analyticsClient.logEvent('test_event', { key: 'value' });
      expect(logger.debug).toHaveBeenCalledWith(
        'Analytics',
        'logEvent:',
        'test_event',
        { key: 'value' },
      );
    });
  });

  describe('logScreenView', () => {
    it('エラーを投げずに完了する', async () => {
      await expect(
        analyticsClient.logScreenView('HomeScreen'),
      ).resolves.toBeUndefined();
    });

    it('__DEV__ 時に logger.debug を呼ぶ', async () => {
      await analyticsClient.logScreenView('HomeScreen');
      expect(logger.debug).toHaveBeenCalledWith(
        'Analytics',
        'logScreenView:',
        'HomeScreen',
      );
    });
  });

  describe('setUserId', () => {
    it('エラーを投げずに完了する', async () => {
      await expect(
        analyticsClient.setUserId('user-123'),
      ).resolves.toBeUndefined();
    });

    it('null を渡せる', async () => {
      await expect(
        analyticsClient.setUserId(null),
      ).resolves.toBeUndefined();
    });

    it('__DEV__ 時に logger.debug を呼ぶ', async () => {
      await analyticsClient.setUserId('user-123');
      expect(logger.debug).toHaveBeenCalledWith(
        'Analytics',
        'setUserId:',
        'user-123',
      );
    });
  });

  describe('setUserProperty', () => {
    it('エラーを投げずに完了する', async () => {
      await expect(
        analyticsClient.setUserProperty('goal_days', '30'),
      ).resolves.toBeUndefined();
    });

    it('null を渡せる', async () => {
      await expect(
        analyticsClient.setUserProperty('goal_days', null),
      ).resolves.toBeUndefined();
    });

    it('__DEV__ 時に logger.debug を呼ぶ', async () => {
      await analyticsClient.setUserProperty('goal_days', '30');
      expect(logger.debug).toHaveBeenCalledWith(
        'Analytics',
        'setUserProperty:',
        'goal_days',
        '30',
      );
    });
  });
});
