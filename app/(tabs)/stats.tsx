import React, { useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useUsageStore } from '@/stores/usageStore';
import { TodayUsageCard } from '@/components/stats/TodayUsageCard';
import { WeeklyBarChart } from '@/components/stats/WeeklyBarChart';
import { TimeWastedCard } from '@/components/stats/TimeWastedCard';
import { UsageEmptyState } from '@/components/stats/UsageEmptyState';
import { StreakCard } from '@/components/dashboard/StreakCard';

export default function StatsScreen() {
  const { todayMs, weeklyData, monthlyMs, hourlyWage, isLoading, loadUsage } =
    useUsageStore();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadUsage();
    }, [])
  );

  const hasData = weeklyData.some((d) => d.totalDuration > 0);

  // Get yesterday's usage from weekly data
  const yesterdayMs =
    weeklyData.length >= 2
      ? weeklyData[weeklyData.length - 2]?.totalDuration
      : undefined;

  if (!hasData && !isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UsageEmptyState />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadUsage}
            tintColor={colors.primary}
          />
        }
      >
        <TodayUsageCard todayMs={todayMs} yesterdayMs={yesterdayMs} />
        {weeklyData.length > 0 && <WeeklyBarChart data={weeklyData} />}
        <TimeWastedCard monthlyMs={monthlyMs} hourlyWage={hourlyWage} />
        <StreakCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});
