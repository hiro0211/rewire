import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { SettingItem } from '@/components/settings/SettingItem';
import { SettingSection } from '@/components/settings/SettingSection';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { TimePickerModal } from '@/components/settings/TimePickerModal';
import { ThemePickerModal } from '@/components/settings/ThemePickerModal';
import { LocalePickerModal } from '@/components/settings/LocalePickerModal';
import { useUserStore } from '@/stores/userStore';
import { useThemeStore } from '@/stores/themeStore';
import { useLocaleStore } from '@/stores/localeStore';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/routing/routes';
import { useBlockerStatus } from '@/hooks/settings/useBlockerStatus';
import { useSettingsHandlers } from '@/hooks/settings/useSettingsHandlers';
import { useSurveyCompleted } from '@/hooks/survey/useSurveyCompleted';
import { useLocale } from '@/hooks/useLocale';
import type { ThemePreference } from '@/types/theme';
import type { LocalePreference } from '@/types/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { colors } = useTheme();
  const { t } = useLocale();
  const themePreference = useThemeStore((s) => s.themePreference);
  const localePreference = useLocaleStore((s) => s.localePreference);

  const [isProfileModalVisible, closeProfileModal] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isThemePickerVisible, setThemePickerVisible] = useState(false);
  const [isLocalePickerVisible, setLocalePickerVisible] = useState(false);

  const { blockerStatus } = useBlockerStatus();
  const { isSurveyCompleted } = useSurveyCompleted();
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
        <SettingSection title={t('settings.sections.profile')}>
          <SettingItem
            label={t('settings.labels.nickname')}
            value={user.nickname}
            onPress={() => closeProfileModal(true)}
          />
          <SettingItem
            label={t('settings.labels.goalDays')}
            value={t('settings.labels.daysFormat', { days: user.goalDays })}
            onPress={() => closeProfileModal(true)}
            isLast
          />
        </SettingSection>

        {Platform.OS === 'ios' && (
          <SettingSection title={t('settings.sections.blocker')}>
            <SettingItem
              label={t('settings.labels.blockerStatus')}
              value={
                blockerStatus === 'checking' ? t('settings.labels.checking') :
                blockerStatus === 'enabled' ? t('settings.labels.enabled') : t('settings.labels.disabled')
              }
              icon={blockerStatus === 'enabled' ? 'shield-checkmark' : 'shield-outline'}
              onPress={blockerStatus !== 'enabled' ? () => Linking.openURL('App-Prefs:SAFARI') : undefined}
            />
            <SettingItem
              label={t('settings.labels.openSafari')}
              icon="open-outline"
              onPress={() => Linking.openURL('App-Prefs:SAFARI')}
            />
            <SettingItem
              label={t('settings.labels.setupGuide')}
              icon="book-outline"
              onPress={() => router.push(ROUTES.contentBlockerSetup)}
              isLast
            />
          </SettingSection>
        )}

        <SettingSection title={t('settings.sections.notifications')}>
          <SettingItem
            label={t('settings.labels.dailyReminder')}
            type="toggle"
            toggleValue={user.notifyEnabled}
            onToggle={handleNotificationToggle}
            isLast={!user.notifyEnabled}
          />
          {user.notifyEnabled && (
            <SettingItem
              label={t('settings.labels.notifyTime')}
              value={user.notifyTime}
              onPress={() => setTimePickerVisible(true)}
              isLast
            />
          )}
        </SettingSection>

        <SettingSection title={t('settings.sections.appearance')}>
          <SettingItem
            label={t('settings.labels.theme')}
            value={t(`settings.theme.${themePreference}`)}
            icon="color-palette-outline"
            onPress={() => setThemePickerVisible(true)}
          />
          <SettingItem
            label={t('settings.labels.language')}
            value={t(`localePicker.${localePreference}`)}
            icon="language-outline"
            onPress={() => setLocalePickerVisible(true)}
            isLast
          />
        </SettingSection>

        <SettingSection title={t('settings.sections.subscription')}>
          <SettingItem
            label={t('settings.labels.manageSubscription')}
            icon="star"
            onPress={handleManageSubscription}
            isLast
          />
        </SettingSection>

        {!isSurveyCompleted && (
          <SettingSection title={t('settings.sections.survey')}>
            <SettingItem
              label={t('settings.labels.survey')}
              icon="chatbubble-ellipses-outline"
              onPress={() => router.push(ROUTES.survey)}
              isLast
            />
          </SettingSection>
        )}

        <SettingSection title={t('settings.sections.support')}>
          <SettingItem
            label={t('settings.labels.contact')}
            icon="mail-outline"
            onPress={() => Linking.openURL('mailto:arimurahiroaki40@gmail.com')}
          />
          <SettingItem
            label={t('settings.labels.terms')}
            onPress={() => router.push(ROUTES.terms)}
          />
          <SettingItem
            label={t('settings.labels.privacyPolicy')}
            onPress={() => router.push(ROUTES.privacyPolicy)}
            isLast
          />
        </SettingSection>

        <SettingSection title={t('settings.sections.data')}>
          <SettingItem
            label={t('settings.labels.resetData')}
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

      <LocalePickerModal
        visible={isLocalePickerVisible}
        currentPreference={localePreference}
        onSelect={(pref) => {
          useLocaleStore.getState().setLocalePreference(pref);
          setLocalePickerVisible(false);
        }}
        onClose={() => setLocalePickerVisible(false)}
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
