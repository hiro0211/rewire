import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { SettingItem } from '@/components/settings/SettingItem';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { TimePickerModal } from '@/components/settings/TimePickerModal';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed'; // Assuming this exists or use RN Text

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, reset } = useUserStore();
  
  const [isProfileModalVisible, colseProfileModal] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

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
    // Mock for now
    Alert.alert('Pro機能', '現在開発中です。');
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
          onPress={() => colseProfileModal(true)}
        />
        <SettingItem
          label="目標日数"
          value={`${user.goalDays}日`}
          onPress={() => colseProfileModal(true)}
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

        {/* Pro Section */}
        <SectionHeader title="プレミアム" />
        <SettingItem
          label={user.isPro ? "Proプラン契約中" : "Proにアップグレード"}
          icon="star"
          onPress={handleProUpgrade}
          value={user.isPro ? "有効" : ""}
        />

        {/* Support Section */}
        <SectionHeader title="サポート" />
        <SettingItem
            label="利用規約"
            onPress={() => Linking.openURL('https://example.com/terms')} 
        />
        <SettingItem
            label="プライバシーポリシー"
            onPress={() => Linking.openURL('https://example.com/privacy')} 
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
        onClose={() => colseProfileModal(false)}
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
