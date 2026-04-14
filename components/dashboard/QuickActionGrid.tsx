import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCircle } from '@/components/ui/GlassCircle';
import { useLocale } from '@/hooks/useLocale';
import { SPACING } from '@/constants/theme';

export function QuickActionGrid() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <View style={styles.grid} testID="quick-action-grid">
      <View style={styles.row}>
        <GlassCircle
          iconName="leaf-outline"
          label={t('quickAction.breathe')}
          onPress={() => router.push('/breathing')}
          testID="qa-breathe"
        />
        <GlassCircle
          iconName="pulse-outline"
          label={t('quickAction.checkin')}
          onPress={() => router.push('/checkin')}
          testID="qa-checkin"
        />
        <GlassCircle
          iconName="calendar-outline"
          label={t('quickAction.calendar')}
          onPress={() => router.push('/history')}
          testID="qa-calendar"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
