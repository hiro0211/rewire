import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme';

interface StreakCalendarHeaderProps {
  onBack: () => void;
  onEdit: () => void;
}

const ICON_BUTTON_SIZE = 36;

export function StreakCalendarHeader({ onBack, onEdit }: StreakCalendarHeaderProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Pressable
        testID="streak-calendar-back"
        onPress={onBack}
        hitSlop={12}
        style={[
          styles.iconButton,
          { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
        ]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>
        {t('calendar.streakCalendarTitle')}
      </Text>

      <Pressable
        testID="streak-calendar-edit"
        onPress={onEdit}
        hitSlop={12}
        style={[
          styles.editButton,
          { backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass },
        ]}
      >
        <Text style={[styles.editLabel, { color: colors.text }]}>
          {t('calendar.edit')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
  },
  editButton: {
    height: ICON_BUTTON_SIZE,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
});
