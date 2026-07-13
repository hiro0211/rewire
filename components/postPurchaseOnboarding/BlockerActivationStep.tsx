import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { BlockerPowerButton } from '@/components/screen-time/BlockerPowerButton';
import { Toast } from '@/components/ui/Toast';
import { useBlockerActivationStep } from '@/hooks/postPurchaseOnboarding/useBlockerActivationStep';

interface BlockerActivationStepProps {
  onComplete: () => void;
}

/**
 * 課金後オンボーディング: ユーザー自身がブロックボタンを押してポルノブロックを
 * 開始する最後の仕上げステップ。押すと保護が有効になり、完了トーストを出して
 * 自動的に完了画面へ進む。
 */
export function BlockerActivationStep({ onComplete }: BlockerActivationStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { enabled, isBusy, toastVisible, handlePress } =
    useBlockerActivationStep(onComplete);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('postPurchaseOnboarding.blockerActivation.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('postPurchaseOnboarding.blockerActivation.description')}
        </Text>

        <BlockerPowerButton
          testID="blocker-activation-power-button"
          enabled={enabled}
          isBusy={isBusy}
          onPress={handlePress}
        />
      </View>

      <Toast
        visible={toastVisible}
        message={t('contentBlocker.activatedToast')}
        testID="blocker-activation-toast"
      />
    </View>
  );
}

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
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: LINE_HEIGHT.xl,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.lg,
    paddingHorizontal: SPACING.lg,
  },
});
