import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

export function NextActionList() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();

  const ACTIONS = [
    { title: t('recovery.actions.breathe'), route: '/breathing' as const, icon: '🌬️' },
    { title: t('recovery.actions.goHome'), route: '/(tabs)' as const, icon: '🏠' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('recovery.nextAction')}</Text>
      {ACTIONS.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(action.route)}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={[styles.text, { color: colors.text }]}>{action.title}</Text>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  text: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  arrow: {
    fontSize: FONT_SIZE.lg,
  },
});
