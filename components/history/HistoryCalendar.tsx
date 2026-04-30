import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { addMonths } from 'date-fns/addMonths';
import { subMonths } from 'date-fns/subMonths';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { getDay } from 'date-fns/getDay';
import { isSameDay } from 'date-fns/isSameDay';
import { useCheckinStore } from '@/stores/checkinStore';
import { useStreak } from '@/hooks/dashboard/useStreak';
import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekDays } from './CalendarWeekDays';
import { CalendarDayCell } from './CalendarDayCell';
import { getDayStatus, dateToKey } from '@/lib/calendar/dayStatus';
import { SPACING } from '@/constants/theme';

export const HistoryCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const checkins = useCheckinStore((state) => state.checkins);
  const { streakStartDate } = useStreak();

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const leadingEmpty = useMemo(() => getDay(startOfMonth(currentMonth)), [currentMonth]);

  const checkinByDate = useMemo(() => {
    const map = new Map<string, (typeof checkins)[number]>();
    checkins.forEach((c) => map.set(c.date, c));
    return map;
  }, [checkins]);

  return (
    <View style={styles.container}>
      <CalendarHeader
        month={currentMonth}
        onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
        onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
      />
      <CalendarWeekDays />
      <View style={styles.grid}>
        {Array.from({ length: leadingEmpty }).map((_, i) => (
          <View key={`leading-${i}`} style={styles.cellWrapper} />
        ))}
        {days.map((date) => {
          const checkin = checkinByDate.get(dateToKey(date));
          const status = getDayStatus({ date, checkin, streakStartDate, today });
          const isToday = isSameDay(date, today);
          return (
            <View key={date.toISOString()} style={styles.cellWrapper}>
              <CalendarDayCell date={date} status={status} isToday={isToday} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrapper: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
