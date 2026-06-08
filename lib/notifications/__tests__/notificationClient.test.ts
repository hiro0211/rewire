import * as Notifications from 'expo-notifications';
import { notificationClient } from '../notificationClient';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

const mockTrackEvent = jest.fn();
jest.mock('@/lib/tracking/trackEvent', () => ({
  trackEvent: (...args: any[]) => mockTrackEvent(...args),
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('notificationClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('既に権限が付与されている場合はtrueを返す', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
        ios: { status: 2 },
      } as any);

      const result = await notificationClient.requestPermissions();
      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('権限が未付与の場合はリクエストを送りtrueを返す', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        expires: 'never',
        granted: false,
        canAskAgain: true,
      } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        granted: true,
        canAskAgain: true,
        ios: { status: 2 },
      } as any);

      const result = await notificationClient.requestPermissions();
      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('権限が拒否された場合はfalseを返す', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        granted: false,
        canAskAgain: false,
      } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        granted: false,
        canAskAgain: false,
      } as any);

      const result = await notificationClient.requestPermissions();
      expect(result).toBe(false);
    });

    it('権限付与時に notification_permission granted=true を送信する', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

      await notificationClient.requestPermissions();

      expect(mockTrackEvent).toHaveBeenCalledWith('notification_permission', { granted: true });
    });

    it('権限拒否時に notification_permission granted=false を送信する', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as any);

      await notificationClient.requestPermissions();

      expect(mockTrackEvent).toHaveBeenCalledWith('notification_permission', { granted: false });
    });
  });

  describe('scheduleDailyReminder', () => {
    it('既存の通知をキャンセルしてから新しい通知をスケジュールする', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    it('指定した時刻（22:00）で通知をスケジュールする', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.trigger).toMatchObject({ hour: 22, minute: 0, repeats: true });
    });

    it('指定した時刻（08:30）で通知をスケジュールする', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('08:30');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.trigger).toMatchObject({ hour: 8, minute: 30, repeats: true });
    });

    it('通知タイトルが設定されている', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.content.title).toBeTruthy();
      expect(typeof callArg.content.title).toBe('string');
    });

    it('通知本文が設定されている', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.content.body).toBeTruthy();
      expect(typeof callArg.content.body).toBe('string');
    });

    it('data payload に action=open_reflection を含む', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.content.data).toEqual({ action: 'open_reflection' });
    });

    it('スケジュール時に notification_scheduled を hour 付きで送信する', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('22:00');

      expect(mockTrackEvent).toHaveBeenCalledWith('notification_scheduled', { hour: 22 });
    });

    it('00:00のエッジケース: hour=0, minute=0 でスケジュールされる', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('00:00');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.trigger).toMatchObject({ hour: 0, minute: 0, repeats: true });
    });

    it('23:59のエッジケース: hour=23, minute=59 でスケジュールされる', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationClient.scheduleDailyReminder('23:59');

      const callArg = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
      expect(callArg.trigger).toMatchObject({ hour: 23, minute: 59, repeats: true });
    });
  });

  describe('cancelAllNotifications', () => {
    it('すべての通知をキャンセルする', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);

      await notificationClient.cancelAllNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    });
  });
});
