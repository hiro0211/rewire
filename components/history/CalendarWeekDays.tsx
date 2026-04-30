import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/theme';

const KEYS = [
  'calendar.weekDays.sun',
  'calendar.weekDays.mon',
  'calendar.weekDays.tue',
  'calendar.weekDays.wed',
  'calendar.weekDays.thu',
  'calendar.weekDays.fri',
  'calendar.weekDays.sat',
];

export function CalendarWeekDays() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.row}>
      {KEYS.map((key, index) => (
        <View key={index} style={styles.cell}>
          <Text
            style={[
              styles.label,
              { color: index === 0 ? colors.error : colors.textSecondary },
            ]}
          >
            {t(key)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.5,
  },
});
