import { AchievementsLinkCard } from '@/components/profile/AchievementsLinkCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SafariExtensionAlertCard } from '@/components/profile/SafariExtensionAlertCard';
import { ToolCard } from '@/components/profile/ToolCard';
import { ContentBlockerPanel } from '@/components/screen-time/ContentBlockerPanel';
import { UninstallLockCard } from '@/components/screen-time/UninstallLockCard';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { SPACING } from '@/constants/theme';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { useSafariSettingsDeepLink } from '@/hooks/safariWebExtension/useSafariSettingsDeepLink';
import { useWebExtensionStatus } from '@/hooks/settings/useWebExtensionStatus';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/routing/routes';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { summary } = useAchievements();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { webExtensionStatus, recheck } = useWebExtensionStatus();
  const openSafariSettings = useSafariSettingsDeepLink();

  const showWarning =
    Platform.OS === 'ios' &&
    (webExtensionStatus === 'never' ||
      webExtensionStatus === 'needsAllUrls');
  const showRefreshPrompt =
    Platform.OS === 'ios' && webExtensionStatus === 'stale';
  const showToolCard =
    Platform.OS === 'ios' &&
    (webExtensionStatus === 'active' || webExtensionStatus === 'checking');

  const warningDescriptionKey =
    webExtensionStatus === 'needsAllUrls'
      ? 'safariWebExtension.alert.descriptionNeedsAllUrls'
      : 'safariWebExtension.alert.descriptionDisabled';

  return (
    <SafeAreaWrapper>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader />

        {/* Achievements Link */}
        <View style={styles.achievementsContainer}>
          <AchievementsLinkCard
            unlocked={summary.unlocked}
            total={summary.total}
            onPress={() => router.push('/achievements')}
          />
        </View>

        {showWarning && (
          <View style={styles.alertContainer}>
            <SafariExtensionAlertCard
              variant="warning"
              title={t('safariWebExtension.alert.title')}
              description={t(warningDescriptionKey)}
              actionLabel={t('safariWebExtension.alert.openSettingsAction')}
              onPress={openSafariSettings}
            />
          </View>
        )}

        {showRefreshPrompt && (
          <View style={styles.alertContainer}>
            <SafariExtensionAlertCard
              variant="info"
              title={t('safariWebExtension.refresh.title')}
              description={t('safariWebExtension.refresh.description')}
              actionLabel={t('safariWebExtension.refresh.recheckAction')}
              onPress={recheck}
            />
          </View>
        )}

        {/* Tool Cards */}
        {showToolCard && (
          <View style={styles.toolCards}>
            <ToolCard
              icon={
                webExtensionStatus === 'active'
                  ? 'shield-checkmark'
                  : 'shield-outline'
              }
              iconColor={colors.danger}
              title={t('safariWebExtension.title')}
              description={t('safariWebExtension.toolCardDescription')}
              onPress={() => router.push(ROUTES.safariWebExtensionSetup)}
            />
          </View>
        )}

        {Platform.OS === 'ios' && <ContentBlockerPanel />}
        {Platform.OS === 'ios' && <UninstallLockCard />}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.xxxl,
  },
  alertContainer: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.xl,
  },
  achievementsContainer: {
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.xl,
  },
  toolCards: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
});
