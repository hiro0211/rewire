import { AchievementsLinkCard } from '@/components/profile/AchievementsLinkCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ToolCard } from '@/components/profile/ToolCard';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { summary } = useAchievements();
  const { colors } = useTheme();
  const { t } = useLocale();

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

        {/* Tool Cards */}
        <View style={styles.toolCards}>
          {Platform.OS === 'ios' && (
            <ToolCard
              icon="shield-outline"
              iconColor={colors.danger}
              title={t('contentBlocker.title')}
              description={t('contentBlocker.blockSites')}
              onPress={() => router.push('/content-blocker-setup' as any)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.xxxl,
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
