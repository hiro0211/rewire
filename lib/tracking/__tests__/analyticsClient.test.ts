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

import { analyticsClient } from '../analyticsClient';

describe('analyticsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('Firebase analytics().logEvent() を呼ぶ', async () => {
      await analyticsClient.logEvent('test_event', { key: 'value' });
      expect(mockLogEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
    });

    it('パラメータなしでも呼べる', async () => {
      await analyticsClient.logEvent('test_event');
      expect(mockLogEvent).toHaveBeenCalledWith('test_event', undefined);
    });

    it('エラー時にクラッシュしない', async () => {
      mockLogEvent.mockRejectedValueOnce(new Error('Firebase error'));
      await expect(
        analyticsClient.logEvent('test_event')
      ).resolves.toBeUndefined();
    });
  });

  describe('logScreenView', () => {
    it('analytics().logScreenView() を呼ぶ', async () => {
      await analyticsClient.logScreenView('HomeScreen');
      expect(mockLogScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });
  });

  describe('setUserId', () => {
    it('analytics().setUserId() を呼ぶ', async () => {
      await analyticsClient.setUserId('user-123');
      expect(mockSetUserId).toHaveBeenCalledWith('user-123');
    });

    it('null を渡せる', async () => {
      await analyticsClient.setUserId(null);
      expect(mockSetUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('setUserProperty', () => {
    it('analytics().setUserProperties() を呼ぶ', async () => {
      await analyticsClient.setUserProperty('goal_days', '30');
      expect(mockSetUserProperties).toHaveBeenCalledWith({ goal_days: '30' });
    });

    it('null を渡せる', async () => {
      await analyticsClient.setUserProperty('goal_days', null);
      expect(mockSetUserProperties).toHaveBeenCalledWith({ goal_days: null });
    });
  });
});
