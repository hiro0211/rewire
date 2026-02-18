import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useRouter, useFocusEffect } from 'expo-router';
import { BannerAdView } from '@/components/ads/BannerAdView';
import { AD_UNIT_IDS } from '@/lib/ads/adConfig';

export default function DashboardScreen() {
  const { user, loadUser } = useUserStore();
  const { loadCheckins, todayCheckin, checkins } = useCheckinStore();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadCheckins();
      loadUser();
    }, [])
  );

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekCheckins = checkins.filter(
      (c) => new Date(c.date) >= weekAgo
    );
    const cleanDays = weekCheckins.filter((c) => !c.watchedPorn).length;
    const totalDays = weekCheckins.length;
    return { cleanDays, totalDays };
  }, [checkins]);

  return (
    <SafeAreaWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>おかえりなさい</Text>
          <Text style={styles.username}>{user?.nickname}</Text>
        </View>

        <StreakCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の振り返り</Text>
          {todayCheckin ? (
            <View style={styles.doneContainer}>
              <Text style={styles.doneText}>完了済み</Text>
              <Text style={styles.doneSubText}>明日も続けましょう。</Text>
              <TouchableOpacity onPress={() => router.push('/checkin')} style={styles.redoButton}>
                <Text style={styles.redoText}>やり直す</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="今日の結果を入力"
              onPress={() => router.push('/checkin')}
              style={styles.checkinButton}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>週間サマリー</Text>
          <View style={styles.summaryCard}>
            {weeklySummary.totalDays > 0 ? (
              <>
                <Text style={styles.summaryNumber}>
                  {weeklySummary.cleanDays}/{weeklySummary.totalDays}
                </Text>
                <Text style={styles.summaryLabel}>日間クリア</Text>
              </>
            ) : (
              <>
                <Text style={styles.summaryEmptyText}>
                  チェックインを始めると{'\n'}週間レポートがここに表示されます
                </Text>
              </>
            )}
          </View>
        </View>

        <BannerAdView unitId={AD_UNIT_IDS.BANNER_DASHBOARD} />
      </ScrollView>
      
      <SOSButton />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  username: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  checkinButton: {
    marginTop: SPACING.xs,
  },
  doneContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doneSubText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  redoButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  redoText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textDecorationLine: 'underline',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryEmptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
