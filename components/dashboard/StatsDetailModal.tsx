import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useCheckinTrends } from '@/hooks/dashboard/useCheckinTrends';
import { Sparkline } from '@/components/ui/Sparkline';

interface StatsDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StatsDetailModal({ visible, onClose }: StatsDetailModalProps) {
  const { colors, glow } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { relapseCount, stopwatch, goalDays, streakStartDate } = useDashboardStats();
  const { urgeLevel, stressLevel, qualityOfLife } = useCheckinTrends(14);
  const { width } = useWindowDimensions();
  const sparkWidth = width - SPACING.lg * 4;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        entering={SlideInUp.springify().damping(18).stiffness(200)}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + SPACING.lg,
            shadowColor: glow.purple,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('streak.currentStreak')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero streak value */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroValue, { color: colors.cyan }]}>{stopwatch.formatted}</Text>
            {streakStartDate && (
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                {t('streak.since', { date: streakStartDate })}
              </Text>
            )}
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('streak.relapseCount')}</Text>
              <Text style={[styles.statValue, { color: relapseCount === 0 ? colors.success : colors.danger }]}>
                {relapseCount}
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('settings.labels.goalDays')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {t('settings.labels.daysFormat', { days: goalDays })}
              </Text>
            </View>
          </View>

          {/* Sparklines */}
          <View style={[styles.sparkSection, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.sparkTitle, { color: colors.textSecondary }]}>
              {t('dashboard.urgeLevel7d')} — 14日間
            </Text>
            <Sparkline data={urgeLevel} color={colors.cyan} width={sparkWidth} height={48} />
          </View>

          <View style={[styles.sparkSection, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.sparkTitle, { color: colors.textSecondary }]}>
              QOL — 14日間
            </Text>
            <Sparkline data={qualityOfLife} color={colors.success} width={sparkWidth} height={48} />
          </View>

          <View style={[styles.sparkSection, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.sparkTitle, { color: colors.textSecondary }]}>
              ストレス — 14日間
            </Text>
            <Sparkline data={stressLevel} color={colors.warning} width={sparkWidth} height={48} />
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    maxHeight: '85%',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
  heroSub: {
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  sparkSection: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sparkTitle: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
});
