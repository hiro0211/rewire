const mockLogEvent = jest.fn();
const mockLogScreenView = jest.fn();
const mockSetUserId = jest.fn();
const mockSetUserProperties = jest.fn();

jest.mock('@react-native-firebase/analytics', () => {
  const analyticsFn = () => ({
    logEvent: mockLogEvent,
    logScreenView: mockLogScreenView,
    setUserId: mockSetUserId,
    setUserProperties: mockSetUserProperties,
  });
  return { __esModule: true, default: analyticsFn };
});

jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: false,
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

import { analyticsClient } from '../analyticsClient';
import { logger } from '@/lib/logger';

describe('analyticsClient (Firebase Analytics, no IDFA)', () => {
  beforeEach(() => {
    mockLogEvent.mockReset().mockResolvedValue(undefined);
    mockLogScreenView.mockReset().mockResolvedValue(undefined);
    mockSetUserId.mockReset().mockResolvedValue(undefined);
    mockSetUserProperties.mockReset().mockResolvedValue(undefined);
    (logger.warn as jest.Mock).mockClear();
    (logger.debug as jest.Mock).mockClear();
  });

  describe('logEvent', () => {
    it('Firebase Analytics の logEvent を呼ぶ', async () => {
      await analyticsClient.logEvent('test_event', { key: 'value' });
      expect(mockLogEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
    });

    it('params なしでも呼べる', async () => {
      await analyticsClient.logEvent('test_event');
      expect(mockLogEvent).toHaveBeenCalledWith('test_event', undefined);
    });

    it('ネイティブ側が失敗してもクラッシュせず logger.warn に通知', async () => {
      mockLogEvent.mockRejectedValueOnce(new Error('native error'));
      await expect(
        analyticsClient.logEvent('test_event'),
      ).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('logScreenView', () => {
    it('screen_name と screen_class を渡して呼ぶ', async () => {
      await analyticsClient.logScreenView('HomeScreen');
      expect(mockLogScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });

    it('失敗しても logger.warn に通知', async () => {
      mockLogScreenView.mockRejectedValueOnce(new Error('native error'));
      await expect(
        analyticsClient.logScreenView('HomeScreen'),
      ).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('setUserId', () => {
    it('ID を渡して setUserId を呼ぶ', async () => {
      await analyticsClient.setUserId('user-123');
      expect(mockSetUserId).toHaveBeenCalledWith('user-123');
    });

    it('null を渡せる', async () => {
      await analyticsClient.setUserId(null);
      expect(mockSetUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserProperty', () => {
    it('key/value のオブジェクトとして setUserProperties を呼ぶ', async () => {
      await analyticsClient.setUserProperty('goal_days', '30');
      expect(mockSetUserProperties).toHaveBeenCalledWith({ goal_days: '30' });
    });

    it('null を渡せる', async () => {
      await analyticsClient.setUserProperty('goal_days', null);
      expect(mockSetUserProperties).toHaveBeenCalledWith({ goal_days: null });
    });
  });

  describe('setUserProperties', () => {
    it('複数のプロパティを1回の呼び出しでまとめて送る', async () => {
      await analyticsClient.setUserProperties({
        discovery_channel: 'tiktok',
        age_range: '25-34',
      });
      expect(mockSetUserProperties).toHaveBeenCalledTimes(1);
      expect(mockSetUserProperties).toHaveBeenCalledWith({
        discovery_channel: 'tiktok',
        age_range: '25-34',
      });
    });

    it('失敗しても throw せず warn する', async () => {
      mockSetUserProperties.mockRejectedValue(new Error('boom'));
      await expect(
        analyticsClient.setUserProperties({ discovery_channel: 'tiktok' })
      ).resolves.toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
