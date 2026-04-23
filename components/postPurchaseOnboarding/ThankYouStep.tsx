import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface ThankYouStepProps {
  onNext: () => void;
}

export function ThankYouStep({ onNext }: ThankYouStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          testID="thank-you-icon"
          style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}
        >
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('postPurchaseOnboarding.thankYou.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('postPurchaseOnboarding.thankYou.description')}
        </Text>
      </View>
      <Button title={t('postPurchaseOnboarding.thankYou.cta')} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.body,
    paddingHorizontal: SPACING.lg,
  },
});
