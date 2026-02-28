import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { GradientCard } from '@/components/ui/GradientCard';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useRouter, useFocusEffect } from 'expo-router';

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
            <GradientCard>
              <View style={styles.doneInner}>
                <Text style={styles.doneText}>完了済み</Text>
                <Text style={styles.doneSubText}>明日も続けましょう。</Text>
                <TouchableOpacity onPress={() => router.push('/checkin')} style={styles.redoButton}>
                  <Text style={styles.redoText}>やり直す</Text>
                </TouchableOpacity>
              </View>
            </GradientCard>
          ) : (
            <Button
              title="今日の結果を入力"
              onPress={() => router.push('/checkin')}
              variant="gradient"
              style={styles.checkinButton}
            />
          )}
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
  doneInner: {
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
  panicButtonContainer: {
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xxxl,
  },
});
