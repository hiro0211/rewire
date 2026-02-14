import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';

const STEPS = [
  {
    title: 'Safariコンテンツブロッカー',
    description: 'Rewireは、Safariでアダルトコンテンツを\n自動的にブロックする機能を提供します。',
    icon: 'shield-checkmark-outline' as const,
  },
  {
    title: '設定アプリを開く',
    description: 'iPhoneの「設定」アプリを開いてください。',
    icon: 'settings-outline' as const,
  },
  {
    title: 'Safari → 機能拡張',
    description: '設定 → Safari → 機能拡張 の順に\nタップしてください。',
    icon: 'compass-outline' as const,
  },
  {
    title: 'Rewireをオンにする',
    description: '「Rewire Content Blocker」を見つけて\nトグルをオンにしてください。',
    icon: 'toggle-outline' as const,
  },
  {
    title: '設定完了！',
    description: 'Safariでアダルトコンテンツが\n自動的にブロックされるようになりました。',
    icon: 'checkmark-circle-outline' as const,
  },
];

export default function ContentBlockerSetupScreen() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      setIsLoading(true);
      try {
        await contentBlockerBridge.reloadBlockerRules();
      } finally {
        setIsLoading(false);
        router.back();
      }
    } else {
      setStep(step + 1);
    }
  }, [step, isLastStep, router]);

  const handleSkip = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openURL('App-Prefs:SAFARI');
  }, []);

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotCompleted,
              ]}
            />
          ))}
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name={currentStep.icon}
            size={80}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>

        {step === 1 && (
          <Button
            title="設定アプリを開く"
            variant="secondary"
            onPress={handleOpenSettings}
            style={styles.openSettingsButton}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={isLastStep ? '完了' : '次へ'}
          onPress={handleNext}
          loading={isLoading}
        />
        <Button
          title="スキップ"
          variant="ghost"
          onPress={handleSkip}
          style={styles.skipButton}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceHighlight,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primary,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  openSettingsButton: {
    width: '100%',
    marginTop: SPACING.md,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  skipButton: {
    marginTop: SPACING.sm,
  },
});
