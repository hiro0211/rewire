import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { useSettingsHandlers } from '../useSettingsHandlers';

const mockUpdateUser = jest.fn();
const mockReset = jest.fn().mockResolvedValue(undefined);
const mockReplace = jest.fn();

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: { notifyEnabled: true, notifyTime: '22:00', nickname: 'テスト', goalDays: 30 },
    updateUser: mockUpdateUser,
    reset: mockReset,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockRequestPermissions = jest.fn();
const mockScheduleDailyReminder = jest.fn();
const mockCancelAllNotifications = jest.fn();

jest.mock('@/lib/notifications/notificationClient', () => ({
  notificationClient: {
    requestPermissions: (...args: any[]) => mockRequestPermissions(...args),
    scheduleDailyReminder: (...args: any[]) => mockScheduleDailyReminder(...args),
    cancelAllNotifications: (...args: any[]) => mockCancelAllNotifications(...args),
  },
}));

jest.spyOn(Alert, 'alert');

describe('useSettingsHandlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNotificationToggle', () => {
    it('true で通知許可成功時に notifyEnabled=true で更新', async () => {
      mockRequestPermissions.mockResolvedValue(true);
      const { result } = renderHook(() => useSettingsHandlers());

      await act(async () => {
        await result.current.handleNotificationToggle(true);
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ notifyEnabled: true });
      expect(mockScheduleDailyReminder).toHaveBeenCalledWith('22:00');
    });

    it('true で通知許可拒否時にアラート表示', async () => {
      mockRequestPermissions.mockResolvedValue(false);
      const { result } = renderHook(() => useSettingsHandlers());

      await act(async () => {
        await result.current.handleNotificationToggle(true);
      });

      expect(Alert.alert).toHaveBeenCalledWith('通知許可が必要です', '設定アプリから通知を許可してください。');
      expect(mockUpdateUser).toHaveBeenCalledWith({ notifyEnabled: false });
    });

    it('false で通知を無効化', async () => {
      const { result } = renderHook(() => useSettingsHandlers());

      await act(async () => {
        await result.current.handleNotificationToggle(false);
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ notifyEnabled: false });
      expect(mockCancelAllNotifications).toHaveBeenCalled();
    });
  });

  describe('handleTimeChange', () => {
    it('時間を更新してリマインダーを再スケジュール', () => {
      const { result } = renderHook(() => useSettingsHandlers());

      act(() => {
        result.current.handleTimeChange('21:00');
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({ notifyTime: '21:00' });
      expect(mockScheduleDailyReminder).toHaveBeenCalledWith('21:00');
    });
  });
});
