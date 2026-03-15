import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE } from '@/constants/theme';

interface LessonProgressBarProps {
  completed: number;
  total: number;
}

export function LessonProgressBar({ completed, total }: LessonProgressBarProps) {
  const { colors } = useTheme();
  const isAllComplete = completed === total;
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.countText, { color: colors.text }]}>
          {completed}/{total}
        </Text>
        {isAllComplete && (
          <View testID="star-icon">
            <Ionicons name="star" size={20} color={colors.warning} />
          </View>
        )}
      </View>
      <View testID="progress-bar">
        <ProgressBar progress={progress} color={colors.cyan} variant="default" height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
