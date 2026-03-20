import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';
import { t } from '@/locales/i18n';

export function useSettingsHandlers() {
  const router = useRouter();
  const { user, updateUser, reset } = useUserStore();

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await notificationClient.requestPermissions();
      if (granted) {
        updateUser({ notifyEnabled: true });
        if (user?.notifyTime) {
          notificationClient.scheduleDailyReminder(user.notifyTime);
        }
      } else {
        Alert.alert(t('settings.alerts.notificationRequired'), t('settings.alerts.notificationRequiredMessage'));
        updateUser({ notifyEnabled: false });
      }
    } else {
      updateUser({ notifyEnabled: false });
      notificationClient.cancelAllNotifications();
    }
  }, [user?.notifyTime, updateUser]);

  const handleTimeChange = useCallback((time: string) => {
    updateUser({ notifyTime: time });
    if (user?.notifyEnabled) {
      notificationClient.scheduleDailyReminder(time);
    }
  }, [user?.notifyEnabled, updateUser]);

  const handleResetData = useCallback(() => {
    Alert.alert(
      t('settings.alerts.resetData'),
      t('settings.alerts.resetDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.alerts.resetConfirm'),
          style: 'destructive',
          onPress: async () => {
            await reset();
            router.replace('/onboarding');
          },
        },
      ]
    );
  }, [reset, router]);

  const handleManageSubscription = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Alert.alert(t('settings.alerts.subscriptionManage'), t('settings.alerts.subscriptionManageMessage'));
    }
  }, []);

  return {
    handleNotificationToggle,
    handleTimeChange,
    handleResetData,
    handleManageSubscription,
  };
}
