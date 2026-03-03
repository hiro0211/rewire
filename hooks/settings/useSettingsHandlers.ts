import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';

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
        Alert.alert('通知許可が必要です', '設定アプリから通知を許可してください。');
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
      'データをリセット',
      'すべての記録と設定が消去されます。この操作は取り消せません。よろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセットする',
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
      Alert.alert('サブスクリプション管理', 'App Storeの設定からサブスクリプションを管理できます。');
    }
  }, []);

  return {
    handleNotificationToggle,
    handleTimeChange,
    handleResetData,
    handleManageSubscription,
  };
}
