import React from 'react';
import { View, StyleSheet, ScrollView, Text, Linking, Pressable } from 'react-native';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

const SectionTitle = ({ children, color }: { children: string; color: string }) => (
  <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
);

const Paragraph = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <Text style={[styles.paragraph, { color }]}>{children}</Text>
);

export default function CreditsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const ccUrl = t('legal.credits.ccUrl');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updatedDate, { color: colors.textSecondary }]}>
          {t('legal.credits.updatedDate')}
        </Text>

        <Paragraph color={colors.textSecondary}>{t('legal.credits.intro')}</Paragraph>

        <SectionTitle color={colors.text}>{t('legal.credits.planetsTitle')}</SectionTitle>
        <Paragraph color={colors.textSecondary}>{t('legal.credits.planetsBody')}</Paragraph>

        <SectionTitle color={colors.text}>{t('legal.credits.cosmicTitle')}</SectionTitle>
        <Paragraph color={colors.textSecondary}>{t('legal.credits.cosmicBody')}</Paragraph>

        <SectionTitle color={colors.text}>{t('legal.credits.licenseTitle')}</SectionTitle>
        <Paragraph color={colors.textSecondary}>{t('legal.credits.licenseBody')}</Paragraph>

        <Pressable
          testID="credits-cc-link"
          onPress={() => Linking.openURL(ccUrl)}
          style={styles.linkRow}
        >
          <Text style={[styles.link, { color: colors.text }]}>
            {t('legal.credits.ccUrlLabel')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  updatedDate: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.body,
  },
  linkRow: {
    marginTop: SPACING.xl,
  },
  link: {
    fontSize: FONT_SIZE.md,
    textDecorationLine: 'underline',
  },
});
