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

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const sections = [
    { title: t('legal.privacy.s1Title'), body: t('legal.privacy.s1Body') },
    { title: t('legal.privacy.s2Title'), body: t('legal.privacy.s2Body') },
    { title: t('legal.privacy.s3Title'), body: t('legal.privacy.s3Body') },
    { title: t('legal.privacy.s4Title'), body: t('legal.privacy.s4Body') },
    { title: t('legal.privacy.s5Title'), body: t('legal.privacy.s5Body') },
    { title: t('legal.privacy.s6Title'), body: t('legal.privacy.s6Body') },
    { title: t('legal.privacy.s7Title'), body: t('legal.privacy.s7Body') },
    { title: t('legal.privacy.s8Title'), body: t('legal.privacy.s8Body') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updatedDate, { color: colors.textSecondary }]}>{t('legal.privacy.updatedDate')}</Text>
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
