import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useCheckinStore } from '@/stores/checkinStore';
import { Ionicons } from '@expo/vector-icons';

export const HistoryCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const checkins = useCheckinStore((state) => state.checkins);
  const { colors, shadows } = useTheme();

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Calculate empty days at start of month for alignment
  const startDay = getDay(startOfMonth(currentMonth));
  const emptyDays = Array(startDay).fill(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const checkin = checkins.find(c => c.date === dateStr);

    if (!checkin) return 'empty';
    if (checkin.watchedPorn) return 'relapse';
    return 'clean';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, shadows.small]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {format(currentMonth, 'yyyy年 M月', { locale: ja })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.weekDays}>
        {weekDays.map((day, index) => (
          <Text key={day} style={[styles.weekDayText, { color: colors.textSecondary }, index === 0 && { color: colors.error }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {emptyDays.map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCell} />
        ))}
        {daysInMonth.map((date) => {
          const status = getDayStatus(date);
          const isToday = isSameDay(date, new Date());

          return (
            <View key={date.toString()} style={styles.dayCell}>
              <View style={[
                styles.dayCircle,
                isToday && { borderWidth: 1, borderColor: colors.primary },
                status === 'clean' && { backgroundColor: colors.success },
                status === 'relapse' && { backgroundColor: colors.error },
              ]}>
                <Text style={[
                  styles.dayText,
                  { color: colors.text },
                  isToday && { color: colors.primary, fontWeight: 'bold' },
                  (status === 'clean' || status === 'relapse') && { color: colors.surface, fontWeight: 'bold' },
                ]}>
                  {format(date, 'd')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>達成</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>リセット</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowButton: {
    padding: SPACING.xs,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
