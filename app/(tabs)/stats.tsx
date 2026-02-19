import React, { useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING } from '@/constants/theme';
import { useUsageStore } from '@/stores/usageStore';
import { TodayUsageCard } from '@/components/stats/TodayUsageCard';
import { WeeklyBarChart } from '@/components/stats/WeeklyBarChart';
import { TimeWastedCard } from '@/components/stats/TimeWastedCard';
import { UsageEmptyState } from '@/components/stats/UsageEmptyState';
import { StreakCard } from '@/components/dashboard/StreakCard';

export default function StatsScreen() {
  const { todayMs, weeklyData, monthlyMs, hourlyWage, isLoading, loadUsage } =
    useUsageStore();

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
      <View style={styles.container}>
        <UsageEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadUsage}
            tintColor={COLORS.primary}
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});
