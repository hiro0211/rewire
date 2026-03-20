import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

const SectionTitle = ({ children, color }: { children: string; color: string }) => (
  <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
);

const Paragraph = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <Text style={[styles.paragraph, { color }]}>{children}</Text>
);

export default function TermsScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const sections = [
    { title: t('legal.terms.s1Title'), body: t('legal.terms.s1Body') },
    { title: t('legal.terms.s2Title'), body: t('legal.terms.s2Body') },
    { title: t('legal.terms.s3Title'), body: t('legal.terms.s3Body') },
    { title: t('legal.terms.s4Title'), body: t('legal.terms.s4Body') },
    { title: t('legal.terms.s5Title'), body: t('legal.terms.s5Body') },
    { title: t('legal.terms.s6Title'), body: t('legal.terms.s6Body') },
    { title: t('legal.terms.s7Title'), body: t('legal.terms.s7Body') },
    { title: t('legal.terms.s8Title'), body: t('legal.terms.s8Body') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updatedDate, { color: colors.textSecondary }]}>{t('legal.terms.updatedDate')}</Text>
        {sections.map((section) => (
          <React.Fragment key={section.title}>
            <SectionTitle color={colors.text}>{section.title}</SectionTitle>
            <Paragraph color={colors.textSecondary}>{section.body}</Paragraph>
          </React.Fragment>
        ))}
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
    fontWeight: 'bold',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
});
