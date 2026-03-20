import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

export function SetupCompletion() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{t('contentBlocker.completionTitle')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('contentBlocker.completionDescription')}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
});
