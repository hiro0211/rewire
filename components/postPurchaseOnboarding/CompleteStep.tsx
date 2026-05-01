import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface CompleteStepProps {
  onFinish: () => void;
}

export function CompleteStep({ onFinish }: CompleteStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          testID="complete-icon"
          style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}
        >
          <Ionicons name="shield-checkmark" size={48} color={colors.success} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('postPurchaseOnboarding.complete.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('postPurchaseOnboarding.complete.description')}
        </Text>
      </View>
      <Button title={t('postPurchaseOnboarding.complete.cta')} onPress={onFinish} />
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
