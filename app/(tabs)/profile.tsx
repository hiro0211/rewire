import { BadgePreviewRow } from '@/components/achievements/BadgePreviewRow';
import { DayCardsRow } from '@/components/achievements/DayCardsRow';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ToolCard } from '@/components/profile/ToolCard';
import { Text } from '@/components/Themed';
import { GradientCard } from '@/components/ui/GradientCard';
import { COLORS, FONT_SIZE, SPACING } from '@/constants/theme';
import { useAchievements } from '@/hooks/achievements/useAchievements';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { achievements, summary, streak } = useAchievements();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader />

        {/* Badge Preview */}
        <View style={styles.section}>
          <BadgePreviewRow achievements={achievements} />
        </View>

        {/* Achievements Link */}
        <View style={styles.achievementsContainer}>
          <GradientCard>
            <TouchableOpacity
              style={styles.achievementsLink}
              onPress={() => router.push('/achievements')}
              activeOpacity={0.7}
            >
              <View style={styles.achievementsLinkLeft}>
                <Text style={styles.achievementsLabel}>Achievements</Text>
                <Text style={styles.achievementsCount}>
                  {summary.unlocked}/{summary.total} Unlocked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </GradientCard>
        </View>

        {/* Day Cards */}
        <View style={styles.section}>
          <DayCardsRow streak={streak} />
        </View>

        {/* Tool Cards */}
        <View style={styles.toolCards}>
          {Platform.OS === 'ios' && (
            <ToolCard
              icon="shield-outline"
              iconColor="#EF4444"
              title="コンテンツブロッカー"
              description="Safariの有害サイトをブロック"
              onPress={() => router.push('/content-blocker-setup' as any)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xxxl,
  },
  section: {
    marginTop: SPACING.lg,
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
    color: COLORS.text,
  },
  achievementsCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toolCards: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.md,
  },
});
