import React from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

export function SetupIntro() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <>
      <Image
        source={require('@/assets/images/icon.png')}
        style={styles.appIcon}
        accessibilityIgnoresInvertColors
      />
      <Text style={[styles.title, { color: colors.text }]}>{t('safariWebExtension.title')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('safariWebExtension.intro')}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    alignSelf: 'center',
    marginBottom: SPACING.xxl,
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
