import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import {
  getDaysInMonth,
  calculateDaysSince,
  getYearRange,
} from '@/lib/date/datePickerUtils';

interface LastViewedDateStepProps {
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
}

export const LastViewedDateStep = ({
  selectedYear,
  selectedMonth,
  selectedDay,
  onYearChange,
  onMonthChange,
  onDayChange,
}: LastViewedDateStepProps) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const years = getYearRange(2020);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysSince = calculateDaysSince(selectedYear, selectedMonth, selectedDay);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('lastViewed.title')}
      </Text>

      <View style={[styles.pickerRow, { backgroundColor: colors.pillBackground }]}>
        <View style={styles.pickerColumn}>
          <Picker
            testID="year-picker"
            selectedValue={selectedYear}
            onValueChange={onYearChange}
            itemStyle={[styles.pickerItem, { color: colors.text }]}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerColumn}>
          <Picker
            testID="month-picker"
            selectedValue={selectedMonth}
            onValueChange={onMonthChange}
            itemStyle={[styles.pickerItem, { color: colors.text }]}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <Picker.Item key={m} label={`${m}${t('lastViewed.monthSuffix')}`} value={m} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerColumn}>
          <Picker
            testID="day-picker"
            selectedValue={selectedDay}
            onValueChange={onDayChange}
            itemStyle={[styles.pickerItem, { color: colors.text }]}
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <Picker.Item key={d} label={`${d}${t('lastViewed.daySuffix')}`} value={d} />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={[styles.daysText, { color: colors.textSecondary }]}>
        {t('lastViewed.startMessage', { days: daysSince })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xxl,
    lineHeight: 42,
  },
  pickerRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 22,
  },
  daysText: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    marginTop: SPACING.xxxl,
    lineHeight: 28,
  },
});
