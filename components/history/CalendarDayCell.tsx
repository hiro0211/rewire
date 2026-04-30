import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format } from 'date-fns/format';
import { useTheme } from '@/hooks/useTheme';
import { FONT_WEIGHT } from '@/constants/theme';
import type { DayStatus } from '@/lib/calendar/dayStatus';

interface CalendarDayCellProps {
  date: Date;
  status: DayStatus;
  isToday: boolean;
}

const CIRCLE_SIZE = 36;

export function CalendarDayCell({ date, status, isToday }: CalendarDayCellProps) {
  const { colors } = useTheme();
  const dayLabel = format(date, 'd');

  const backgroundColor =
    status === 'clean'
      ? colors.streakActive
      : status === 'relapse'
      ? colors.error
      : 'transparent';

  const borderColor =
    status === 'empty-no-data'
      ? colors.borderGlass
      : 'transparent';

  const showCheck = status === 'clean';
  const showClose = status === 'relapse';
  const showText = status === 'empty-no-data' || status === 'empty-pre-streak' || status === 'empty-future';

  const textColor =
    status === 'empty-future'
      ? colors.textSecondary
      : status === 'empty-pre-streak'
      ? colors.textSecondary
      : colors.text;
  const textOpacity = status === 'empty-future' ? 0.4 : status === 'empty-pre-streak' ? 0.5 : 0.85;

  return (
    <View style={styles.cellWrapper} testID={`calendar-day-cell-${status}`}>
      <View
        style={[
          styles.circle,
          { backgroundColor, borderColor, borderWidth: borderColor === 'transparent' ? 0 : 1 },
        ]}
      >
        {showCheck && <Ionicons name="checkmark" size={20} color={colors.contrastText} />}
        {showClose && <Ionicons name="close" size={20} color={colors.contrastText} />}
        {showText && (
          <Text
            style={[
              styles.dayText,
              { color: textColor, opacity: textOpacity },
            ]}
          >
            {dayLabel}
          </Text>
        )}
      </View>
      {isToday && (
        <View
          testID="calendar-day-cell-today-ring"
          pointerEvents="none"
          style={[styles.todayRing, { borderColor: colors.contrastText }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cellWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.medium,
  },
  todayRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: (CIRCLE_SIZE + 6) / 2,
    borderWidth: 2,
  },
});
