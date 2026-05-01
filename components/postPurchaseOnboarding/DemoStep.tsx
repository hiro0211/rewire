import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';
import { DEMO_TEST_URL } from '@/constants/postPurchaseOnboarding';
import { ExtensionConfirmModal } from './ExtensionConfirmModal';

interface DemoStepProps {
  onTestBlock: () => void;
  onSkip: () => void;
  showRetryHint?: boolean;
}

export function DemoStep({ onTestBlock, onSkip, showRetryHint }: DemoStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleTestBlock = () => {
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    onTestBlock();
    Linking.openURL(DEMO_TEST_URL).catch(() => {});
  };

  const handleOpenSettings = () => {
    Linking.openURL('app-settings:').catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View
          testID="demo-icon"
          style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}
        >
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('postPurchaseOnboarding.demo.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('postPurchaseOnboarding.demo.description')}
        </Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surfaceGlass }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('postPurchaseOnboarding.demo.notice')}
          </Text>
        </View>

        {showRetryHint && (
          <Text style={[styles.retryHint, { color: colors.textSecondary }]}>
            {t('postPurchaseOnboarding.demo.retryHint')}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={t('postPurchaseOnboarding.demo.testButton')}
          onPress={handleTestBlock}
        />
        <TouchableOpacity onPress={onSkip} testID="demo-skip" style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {t('postPurchaseOnboarding.demo.skipButton')}
          </Text>
        </TouchableOpacity>
      </View>

      <ExtensionConfirmModal
        visible={confirmVisible}
        onConfirm={handleConfirm}
        onOpenSettings={handleOpenSettings}
        onClose={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
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
    marginBottom: SPACING.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  retryHint: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  footer: {
    gap: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
});
