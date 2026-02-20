import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Linking, AppState } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { SettingItem } from '@/components/settings/SettingItem';
import { SettingSection } from '@/components/settings/SettingSection';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { TimePickerModal } from '@/components/settings/TimePickerModal';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';
import { useRouter } from 'expo-router';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
// Safari Web Extension トラッキング実装後に有効化
// import { useUsageStore } from '@/stores/usageStore';
import RevenueCatUI from 'react-native-purchases-ui';
import { Text } from '@/components/Themed';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, reset } = useUserStore();

  const [isProfileModalVisible, closeProfileModal] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  // Safari Web Extension トラッキング実装後に有効化
  // const { hourlyWage, setHourlyWage } = useUsageStore();

  const checkBlockerStatus = async () => {
    if (Platform.OS === 'ios') {
      const status = await contentBlockerBridge.getBlockerStatus();
      setBlockerEnabled(status.isEnabled);
    }
  };

  useEffect(() => {
    checkBlockerStatus();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkBlockerStatus();
    });
    return () => sub.remove();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
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
  };

  const handleTimeChange = (time: string) => {
    updateUser({ notifyTime: time });
    if (user?.notifyEnabled) {
      notificationClient.scheduleDailyReminder(time);
    }
  };

  const handleResetData = () => {
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
  };

  const handleProUpgrade = () => {
    router.push('/paywall');
  };

  const handleManageSubscription = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.error('[Settings] Customer Center failed:', e);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const status = await subscriptionClient.restorePurchases();
      if (status.isActive) {
        await updateUser({ isPro: true });
        Alert.alert('復元完了', 'Pro機能が復元されました。');
      } else {
        Alert.alert('復元結果', '有効なサブスクリプションが見つかりませんでした。');
      }
    } catch (e) {
      Alert.alert('エラー', '復元に失敗しました。');
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <SettingSection title="プロフィール">
          <SettingItem
            label="ニックネーム"
            value={user.nickname}
            onPress={() => closeProfileModal(true)}
          />
          <SettingItem
            label="目標日数"
            value={`${user.goalDays}日`}
            onPress={() => closeProfileModal(true)}
            isLast
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="通知">
          <SettingItem
            label="デイリーリマインダー"
            type="toggle"
            toggleValue={user.notifyEnabled}
            onToggle={handleNotificationToggle}
            isLast={!user.notifyEnabled}
          />
          {user.notifyEnabled && (
            <SettingItem
              label="通知時間"
              value={user.notifyTime}
              onPress={() => setTimePickerVisible(true)}
              isLast
            />
          )}
        </SettingSection>

        {/* Safari Extension Section - iOS only */}
        {Platform.OS === 'ios' && (
          <SettingSection title="Safari拡張機能">
            <SettingItem
              label="ブロック状態"
              type="value"
              value={blockerEnabled ? '有効' : '無効'}
              icon="shield-checkmark-outline"
            />
            <SettingItem
              label="設定ガイド"
              icon="book-outline"
              onPress={() => router.push('/safari-extension-setup' as any)}
            />
            {/* Safari Web Extension トラッキング実装後に有効化
            <SettingItem
              label="ドメイン管理"
              icon="list-outline"
              onPress={() => router.push('/domain-management' as any)}
            />
            */}
            <SettingItem
              label="カスタムブロックリスト"
              icon="ban-outline"
              onPress={() => router.push('/custom-blocklist' as any)}
              isLast
            />
            {/* Safari Web Extension トラッキング実装後に有効化
            <SettingItem
              label="時給設定"
              type="value"
              value={`¥${hourlyWage.toLocaleString()}`}
              icon="cash-outline"
              onPress={() => {
                Alert.prompt(
                  '時給設定',
                  '統計画面の金額換算に使用します',
                  (text) => {
                    const val = parseInt(text, 10);
                    if (!isNaN(val) && val > 0) setHourlyWage(val);
                  },
                  'plain-text',
                  String(hourlyWage),
                  'number-pad'
                );
              }}
              isLast
            />
            */}
          </SettingSection>
        )}

        {/* Pro Section */}
        <SettingSection title="プレミアム">
          {user.isPro ? (
            <SettingItem
              label="サブスクリプション管理"
              icon="star"
              onPress={handleManageSubscription}
              value="Pro 有効"
              isLast
            />
          ) : (
            <>
              <SettingItem
                label="Proにアップグレード"
                icon="star"
                onPress={handleProUpgrade}
              />
              <SettingItem
                label="購入を復元"
                icon="refresh-outline"
                onPress={handleRestorePurchases}
                isLast
              />
            </>
          )}
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="サポート">
          <SettingItem
            label="お問い合わせ"
            icon="mail-outline"
            onPress={() => Linking.openURL('mailto:arimurahiroaki40@gmail.com')}
          />
          <SettingItem
            label="利用規約"
            onPress={() => router.push('/terms' as any)}
          />
          <SettingItem
            label="プライバシーポリシー"
            onPress={() => router.push('/privacy-policy' as any)}
            isLast
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="データ管理">
          <SettingItem
            label="データをリセット"
            destructive
            onPress={handleResetData}
            icon="trash-outline"
            isLast
          />
        </SettingSection>

        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
      </ScrollView>

      {/* Modals */}
      <ProfileEditModal
        visible={isProfileModalVisible}
        initialNickname={user.nickname}
        initialGoalDays={user.goalDays}
        onClose={() => closeProfileModal(false)}
        onSave={(nickname, goalDays) => updateUser({ nickname, goalDays })}
      />

      <TimePickerModal
        visible={isTimePickerVisible}
        currentTime={user.notifyTime}
        onClose={() => setTimePickerVisible(false)}
        onSave={handleTimeChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
