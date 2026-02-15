import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { SettingItem } from '@/components/settings/SettingItem';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { TimePickerModal } from '@/components/settings/TimePickerModal';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';
import { useRouter } from 'expo-router';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';
import { subscriptionClient } from '@/lib/subscription/subscriptionClient';
import RevenueCatUI from 'react-native-purchases-ui';
import { Text } from '@/components/Themed'; // Assuming this exists or use RN Text

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, reset } = useUserStore();
  
  const [isProfileModalVisible, closeProfileModal] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  const [blockerLoading, setBlockerLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      contentBlockerBridge.getBlockerStatus().then((status) => {
        setBlockerEnabled(status.isEnabled);
      });
    }
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

  const handleBlockerToggle = async (value: boolean) => {
    setBlockerLoading(true);
    try {
      if (value) {
        const success = await contentBlockerBridge.enableBlocker();
        setBlockerEnabled(success);
      } else {
        const success = await contentBlockerBridge.disableBlocker();
        setBlockerEnabled(!success);
      }
    } catch (e) {
      Alert.alert('エラー', 'ポルノブロッカーの設定に失敗しました。');
    } finally {
      setBlockerLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <SectionHeader title="プロフィール" />
        <SettingItem
          label="ニックネーム"
          value={user.nickname}
          onPress={() => closeProfileModal(true)}
        />
        <SettingItem
          label="目標日数"
          value={`${user.goalDays}日`}
          onPress={() => closeProfileModal(true)}
        />

        {/* Notifications Section */}
        <SectionHeader title="通知" />
        <SettingItem
          label="デイリーリマインダー"
          type="toggle"
          toggleValue={user.notifyEnabled}
          onToggle={handleNotificationToggle}
        />
        {user.notifyEnabled && (
          <SettingItem
            label="通知時間"
            value={user.notifyTime}
            onPress={() => setTimePickerVisible(true)}
          />
        )}

        {/* Content Blocker Section - iOS only */}
        {Platform.OS === 'ios' && (
          <>
            <SectionHeader title="ポルノブロッカー" />
            <SettingItem
              label="アダルトサイトをブロック"
              type="toggle"
              toggleValue={blockerEnabled}
              onToggle={handleBlockerToggle}
              icon="shield-checkmark-outline"
            />
            <SettingItem
              label="設定ガイド"
              icon="book-outline"
              onPress={() => router.push('/content-blocker-setup' as any)}
            />
          </>
        )}

        {/* Pro Section */}
        <SectionHeader title="プレミアム" />
        {user.isPro ? (
          <SettingItem
            label="サブスクリプション管理"
            icon="star"
            onPress={handleManageSubscription}
            value="Pro 有効"
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
            />
          </>
        )}

        {/* Support Section */}
        <SectionHeader title="サポート" />
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
        />

        {/* Danger Zone */}
        <SectionHeader title="データ管理" />
        <SettingItem
          label="データをリセット"
          destructive
          onPress={handleResetData}
          icon="trash-outline"
        />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceHighlight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    textTransform: 'uppercase',
  },
  version: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
