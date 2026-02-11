import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { SOSButton } from '@/components/dashboard/SOSButton';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useUserStore();
  const { loadCheckins, todayCheckin } = useCheckinStore();
  const router = useRouter();

  useEffect(() => {
    loadCheckins();
  }, []);

  return (
    <SafeAreaWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>おかえりなさい</Text>
          <Text style={styles.username}>{user?.nickname}</Text>
        </View>

        <StreakCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日のチェックイン</Text>
          {todayCheckin ? (
            <View style={styles.doneContainer}>
              <Text style={styles.doneText}>完了済み ✅</Text>
              <Text style={styles.doneSubText}>明日も続けましょう。</Text>
            </View>
          ) : (
            <Button
              title="チェックインする"
              onPress={() => router.push('/checkin')}
              style={styles.checkinButton}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>週間サマリー</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>データ収集中...</Text>
          </View>
        </View>
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
  placeholderCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
});
