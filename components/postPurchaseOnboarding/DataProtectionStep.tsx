import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface DataProtectionStepProps {
  onNext: () => void;
}

/**
 * 課金後オンボーディング: スクリーンタイム許可の直前に、利用データが Apple に
 * 保護され開発者は閲覧できないことを伝えて不安を取り除く情報画面。
 */
export const DataProtectionStep = ({ onNext }: DataProtectionStepProps) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {t('postPurchaseOnboarding.dataProtection.title')}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('postPurchaseOnboarding.dataProtection.description')}
        </Text>
      </View>

      <Button
        title={t('common.next')}
        onPress={onNext}
        variant="gradient"
        style={styles.nextButton}
        testID="data-protection-next"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  body: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: LINE_HEIGHT.xl,
  },
  description: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.lg,
    paddingHorizontal: SPACING.md,
  },
  nextButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
});
