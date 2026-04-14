import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { QuickActionButton } from './QuickActionButton';
import { useLocale } from '@/hooks/useLocale';
import { SPACING } from '@/constants/theme';

export function QuickActionRow() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <View style={styles.row} testID="quick-action-row">
      <QuickActionButton
        icon="leaf-outline"
        label={t('quickAction.breathe')}
        onPress={() => router.push('/breathing')}
        testID="qa-breathe"
      />
      <QuickActionButton
        icon="pulse-outline"
        label={t('quickAction.checkin')}
        onPress={() => router.push('/checkin')}
        testID="qa-checkin"
      />
      <QuickActionButton
        icon="book-outline"
        label={t('quickAction.journal')}
        onPress={() => router.push('/history')}
        testID="qa-journal"
      />
      <QuickActionButton
        icon="warning-outline"
        label={t('quickAction.sos')}
        onPress={() => router.push('/breathing')}
        testID="qa-sos"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
  },
});
