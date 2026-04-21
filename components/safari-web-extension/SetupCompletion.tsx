import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
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
      <Text style={[styles.title, { color: colors.text }]}>{t('safariWebExtension.completionTitle')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('safariWebExtension.completionDescription')}
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
    alignSelf: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.body,
    marginBottom: SPACING.xl,
  },
});
