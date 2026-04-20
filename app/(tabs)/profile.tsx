import { AchievementsLinkCard } from '@/components/profile/AchievementsLinkCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { SPACING } from '@/constants/theme';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { summary } = useAchievements();

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
        <View style={styles.toolCards} />
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
