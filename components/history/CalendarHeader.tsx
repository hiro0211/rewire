import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format } from 'date-fns/format';
import { ja } from 'date-fns/locale/ja';
import { enUS } from 'date-fns/locale/en-US';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { FONT_WEIGHT, FONT_SIZE, SPACING } from '@/constants/theme';

interface CalendarHeaderProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function CalendarHeader({ month, onPrev, onNext }: CalendarHeaderProps) {
  const { colors } = useTheme();
  const { isJapanese } = useLocale();
  const formatStr = isJapanese ? 'yyyy年 M月' : 'MMMM yyyy';
  const locale = isJapanese ? ja : enUS;

  return (
    <View style={styles.container}>
      <Pressable
        testID="calendar-header-prev"
        onPress={onPrev}
        hitSlop={12}
        style={styles.button}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>
        {format(month, formatStr, { locale })}
      </Text>
      <Pressable
        testID="calendar-header-next"
        onPress={onNext}
        hitSlop={12}
        style={styles.button}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
