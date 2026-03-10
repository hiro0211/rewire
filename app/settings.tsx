import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { SettingItem } from '@/components/settings/SettingItem';
import { SettingSection } from '@/components/settings/SettingSection';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { TimePickerModal } from '@/components/settings/TimePickerModal';
import { ThemePickerModal } from '@/components/settings/ThemePickerModal';
import { useUserStore } from '@/stores/userStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/routing/routes';
import { useBlockerStatus } from '@/hooks/settings/useBlockerStatus';
import { useSettingsHandlers } from '@/hooks/settings/useSettingsHandlers';
import type { ThemePreference } from '@/types/theme';

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'システム設定',
  light: 'ライトモード',
  dark: 'ダークモード',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { colors } = useTheme();
  const themePreference = useThemeStore((s) => s.themePreference);

  const [isProfileModalVisible, closeProfileModal] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isThemePickerVisible, setThemePickerVisible] = useState(false);

  const { blockerStatus } = useBlockerStatus();
  const {
    handleNotificationToggle,
    handleTimeChange,
    handleResetData,
    handleManageSubscription,
  } = useSettingsHandlers();

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
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

        {Platform.OS === 'ios' && (
          <SettingSection title="ポルノブロッカー">
            <SettingItem
              label="ブロック状態"
              value={
                blockerStatus === 'checking' ? '確認中...' :
                blockerStatus === 'enabled' ? '有効' : '無効'
              }
              icon={blockerStatus === 'enabled' ? 'shield-checkmark' : 'shield-outline'}
              onPress={blockerStatus !== 'enabled' ? () => Linking.openURL('App-Prefs:SAFARI') : undefined}
            />
            <SettingItem
              label="Safari設定を開く"
              icon="open-outline"
              onPress={() => Linking.openURL('App-Prefs:SAFARI')}
            />
            <SettingItem
              label="設定ガイド"
              icon="book-outline"
              onPress={() => router.push(ROUTES.contentBlockerSetup)}
              isLast
            />
          </SettingSection>
        )}

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

        <SettingSection title="外観">
          <SettingItem
            label="テーマ"
            value={THEME_LABELS[themePreference]}
            icon="color-palette-outline"
            onPress={() => setThemePickerVisible(true)}
            isLast
          />
        </SettingSection>

        <SettingSection title="サブスクリプション">
          <SettingItem
            label="サブスクリプション管理"
            icon="star"
            onPress={handleManageSubscription}
            isLast
          />
        </SettingSection>

        <SettingSection title="サポート">
          <SettingItem
            label="お問い合わせ"
            icon="mail-outline"
            onPress={() => Linking.openURL('mailto:arimurahiroaki40@gmail.com')}
          />
          <SettingItem
            label="利用規約"
            onPress={() => router.push(ROUTES.terms)}
          />
          <SettingItem
            label="プライバシーポリシー"
            onPress={() => router.push(ROUTES.privacyPolicy)}
            isLast
          />
        </SettingSection>

        <SettingSection title="データ管理">
          <SettingItem
            label="データをリセット"
            destructive
            onPress={handleResetData}
            icon="trash-outline"
            isLast
          />
        </SettingSection>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 (Build 1)</Text>
      </ScrollView>

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

      <ThemePickerModal
        visible={isThemePickerVisible}
        currentPreference={themePreference}
        onSelect={(pref) => {
          useThemeStore.getState().setThemePreference(pref);
          setThemePickerVisible(false);
        }}
        onClose={() => setThemePickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});
