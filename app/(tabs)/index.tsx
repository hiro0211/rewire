import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const MOTIVATIONAL_QUOTES = [
  '一歩ずつ。今日の自分を信じよう。',
  '変化は一瞬で起きなくていい。続けることが力になる。',
  '今この瞬間、あなたは前に進んでいる。',
  '小さな勝利の積み重ねが、大きな変化を生む。',
  'あなたの脳は回復する力を持っている。',
  '今日をクリアすれば、明日はもっと楽になる。',
  '完璧じゃなくていい。続けることが大事。',
];

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

export default function DashboardScreen() {
  const { user, loadUser } = useUserStore();
  const { loadCheckins, todayCheckin } = useCheckinStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCheckins();
      loadUser();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCheckins(), loadUser()]);
    setRefreshing(false);
  }, [loadCheckins, loadUser]);

  return (
    <SafeAreaWrapper style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.cyan}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>おかえりなさい</Text>
          <Text style={styles.username}>{user?.nickname}</Text>
        </View>

        <StatsRow />

        {/* Today's Check-in */}
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

        {/* Motivational Quote */}
        <View testID="motivational-quote" style={styles.quoteCard}>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.cyan} />
          <Text style={styles.quoteText}>{getDailyQuote()}</Text>
        </View>

        {/* Panic Button (inline) */}
        <View style={styles.panicButtonContainer}>
          <SOSButton />
        </View>

      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
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
    marginBottom: SPACING.xxxl,
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
    borderRadius: RADIUS.lg,
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
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xxxl,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  quoteText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  panicButtonContainer: {
    marginBottom: SPACING.xxxl,
  },
});
