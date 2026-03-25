import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { GradientCard } from '@/components/ui/GradientCard';
import { GlowDivider } from '@/components/ui/GlowDivider';
import { Sparkline } from '@/components/ui/Sparkline';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useUserStore } from '@/stores/userStore';
import { usePressAnimation } from '@/hooks/ui/usePressAnimation';
import { useCheckinTrends } from '@/hooks/dashboard/useCheckinTrends';
import { StreakEditModal } from './StreakEditModal';
import { StatsDetailModal } from './StatsDetailModal';
import { format, parseISO } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

function formatStartDate(dateStr: string | null, t: (key: string, opts?: Record<string, unknown>) => string, isJapanese: boolean): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, isJapanese ? 'yyyy/MM/dd' : 'MM/dd/yyyy', { locale: isJapanese ? jaLocale : enUS });
    return t('streak.since', { date: formatted });
  } catch {
    return '';
  }
}

interface StatsRowProps {
  onShare: () => void;
  viewShotRef?: React.RefObject<any>;
  ViewShotComponent?: React.ComponentType<any>;
}

export function StatsRow({ onShare, viewShotRef, ViewShotComponent }: StatsRowProps) {
  const { relapseCount, stopwatch, goalDays, streakStartDate } = useDashboardStats();
  const { updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { colors, glow } = useTheme();
  const { t, isJapanese } = useLocale();
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation();
  const { urgeLevel } = useCheckinTrends(7);
  const { width: screenWidth } = useWindowDimensions();
  const sparklineWidth = screenWidth - SPACING.lg * 2 - 64;

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare();
  };

  const Wrapper = ViewShotComponent ?? View;
  const wrapperProps = ViewShotComponent
    ? { ref: viewShotRef, options: { format: 'png', quality: 1 } }
    : {};

  return (
    <View testID="stats-row" style={styles.wrapper}>
      <Wrapper {...wrapperProps}>
        <GradientCard variant="hero" testID="stat-stopwatch">
          <Animated.View style={animatedStyle}>
          <TouchableOpacity
            testID="hero-card-touch"
            onPress={() => setDetailModalVisible(true)}
            onLongPress={() => setEditModalVisible(true)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={0.9}
            style={styles.heroInner}
          >
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>{t('streak.currentStreak')}</Text>
            <Text
              style={[styles.heroValue, { color: colors.cyan }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {stopwatch.formatted}
            </Text>
            {streakStartDate ? (
              <Text style={[styles.heroSince, { color: colors.textSecondary }]}>{formatStartDate(streakStartDate, t, isJapanese)}</Text>
            ) : null}

            <GlowDivider />

            <View style={styles.sparklineRow}>
              <Text style={[styles.sparklineLabel, { color: colors.textSecondary }]}>
                {t('dashboard.urgeLevel7d')}
              </Text>
              <Sparkline
                data={urgeLevel}
                color={colors.cyan}
                width={Math.max(sparklineWidth, 80)}
                height={32}
              />
            </View>

            <View style={styles.inlineStats}>
              <View testID="stat-relapse" style={styles.inlineStat}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{t('streak.relapseCount')}</Text>
                <Text
                  style={[
                    styles.miniValue,
                    { color: relapseCount === 0 ? colors.success : colors.danger },
                  ]}
                >
                  {relapseCount}
                </Text>
              </View>

              <View style={[styles.inlineDivider, {
                backgroundColor: glow.purple,
                shadowColor: glow.purple,
              }]} />

              <View testID="stat-goal" style={styles.inlineStat}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{t('settings.labels.goalDays')}</Text>
                <Text style={[styles.miniValue, { color: colors.text }]}>{t('settings.labels.daysFormat', { days: goalDays })}</Text>
              </View>
            </View>
          </TouchableOpacity>
          </Animated.View>
        </GradientCard>
      </Wrapper>

      <TouchableOpacity
        testID="share-button"
        onPress={handleShare}
        style={styles.shareButton}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.shareText, { color: colors.textSecondary }]}>{t('dashboard.share')}</Text>
      </TouchableOpacity>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={streakStartDate || new Date().toISOString().split('T')[0]}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSave}
      />

      <StatsDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xxxl,
  },
  heroInner: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  heroSince: {
    fontSize: FONT_SIZE.xs,
  },
  sparklineRow: {
    width: '100%',
    marginVertical: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  sparklineLabel: {
    fontSize: FONT_SIZE.xs,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  inlineStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  inlineStat: {
    flex: 1,
    alignItems: 'center',
  },
  inlineDivider: {
    width: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  miniLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  miniValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  shareText: {
    fontSize: FONT_SIZE.xs,
  },
});
