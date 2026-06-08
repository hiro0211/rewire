import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCircle } from '@/components/ui/GlassCircle';
import { useLocale } from '@/hooks/useLocale';
import { useReflectionSheet } from '@/hooks/reflection/useReflectionSheet';
import { SPACING } from '@/constants/theme';
import { trackEvent } from '@/lib/tracking/trackEvent';

export function QuickActionGrid() {
  const router = useRouter();
  const { t } = useLocale();
  const openReflection = useReflectionSheet((s) => s.open);

  const handle = (action: 'breathe' | 'checkin' | 'calendar', run: () => void) => {
    trackEvent('quick_action_tapped', { action });
    run();
  };

  return (
    <View style={styles.grid} testID="quick-action-grid">
      <View style={styles.row}>
        <GlassCircle
          iconName="leaf-outline"
          label={t('quickAction.breathe')}
          onPress={() => handle('breathe', () => router.push('/breathing'))}
          testID="qa-breathe"
        />
        <GlassCircle
          iconName="pulse-outline"
          label={t('quickAction.checkin')}
          onPress={() => handle('checkin', () => openReflection('manual'))}
          testID="qa-checkin"
        />
        <GlassCircle
          iconName="calendar-outline"
          label={t('quickAction.calendar')}
          onPress={() => handle('calendar', () => router.push('/history'))}
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
