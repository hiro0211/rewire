import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCircle } from '@/components/ui/GlassCircle';
import { useLocale } from '@/hooks/useLocale';
import { useReflectionSheet } from '@/hooks/reflection/useReflectionSheet';
import { SPACING } from '@/constants/theme';

export function QuickActionGrid() {
  const router = useRouter();
  const { t } = useLocale();
  const openReflection = useReflectionSheet((s) => s.open);

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
          onPress={openReflection}
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
