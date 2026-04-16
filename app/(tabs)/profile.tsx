import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ToolCard } from '@/components/profile/ToolCard';
import { GradientCard } from '@/components/ui/GradientCard';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <GradientCard>
            <TouchableOpacity
              style={styles.achievementsLink}
              onPress={() => router.push('/achievements')}
              activeOpacity={0.7}
            >
              <View style={styles.achievementsLinkLeft}>
                <Text style={[styles.achievementsLabel, { color: colors.text }]}>Achievements</Text>
                <Text style={[styles.achievementsCount, { color: colors.textSecondary }]}>
                  {summary.unlocked}/{summary.total} Unlocked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </GradientCard>
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
  achievementsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsLinkLeft: {
    flex: 1,
  },
  achievementsLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  achievementsCount: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  toolCards: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
});
