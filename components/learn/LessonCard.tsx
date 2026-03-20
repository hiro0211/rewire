import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, RADIUS, FONT_SIZE } from '@/constants/theme';
import type { Lesson } from '@/constants/lessons';

type LessonStatus = 'active' | 'locked' | 'completed';

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  onPress: () => void;
}

export function LessonCard({ lesson, status, onPress }: LessonCardProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const borderColor =
    status === 'active'
      ? colors.cyan
      : status === 'completed'
        ? colors.success
        : colors.surfaceHighlight;

  const isDisabled = status === 'locked';

  return (
    <TouchableOpacity
      testID={`lesson-card-${lesson.id}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.lessonLabel, { color: colors.textSecondary }]}>
          Lesson {lesson.number}
        </Text>
        <View style={styles.headerRight}>
          {status === 'locked' ? (
            <Ionicons testID="lock-icon" name="lock-closed" size={16} color={colors.textSecondary} />
          ) : (
            <Text style={[styles.readTime, { color: colors.textSecondary }]}>
              {lesson.readMinutes}{t('learn.minuteUnit')}
            </Text>
          )}
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t(lesson.titleKey)}
      </Text>

      <View style={styles.footer}>
        {status === 'active' && (
          <View style={styles.actionRow}>
            <Text style={[styles.actionText, { color: colors.cyan }]}>
              {t('learn.startReading')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.cyan} />
          </View>
        )}
        {status === 'completed' && (
          <View style={styles.actionRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.completedText, { color: colors.success }]}>
              {t('learn.completed')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  readTime: {
    fontSize: FONT_SIZE.xs,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  completedText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
