import * as Notifications from 'expo-notifications';
import { t } from '@/locales/i18n';
import { trackEvent } from '@/lib/tracking/trackEvent';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationClient = {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    trackEvent('notification_permission', { granted });
    return granted;
  },

  async scheduleDailyReminder(time: string) {
    // time format: "HH:mm"
    const [hour, minute] = time.split(':').map(Number);

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notification.reminderTitle'),
        body: t('notification.reminderBody'),
        data: { action: 'open_reflection' },
      },
      trigger: {
        type: 'calendar',
        hour,
        minute,
        repeats: true,
      }
    });

    trackEvent('notification_scheduled', { hour });
  },

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
