import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StepBadge } from '@/components/content-blocker/StepBadge';
import { ScreenshotStep } from '@/components/content-blocker/ScreenshotStep';
import { useContentBlockerStatus } from '@/hooks/useContentBlockerStatus';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';
const TOTAL_STEPS = 5;

const STEP_IMAGES = {
  1: require('@/assets/images/content-blocker/step1-settings-apps.jpg'),
  2: require('@/assets/images/content-blocker/step2-safari-extensions.jpg'),
  3: require('@/assets/images/content-blocker/step3-enable-rewire.jpg'),
} as const;

const STEP_HIGHLIGHTS = {
  1: { top: 80, left: 3, width: 90, height: 8 },
  2: { top: 45, left: 5, width: 90, height: 7 },
  3: { top: 27, left: 5, width: 90, height: 7 },
} as const;

export default function ContentBlockerSetupScreen() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  useContentBlockerStatus(step, () => {
    setStep(4);
  });

  const handleNext = useCallback(async () => {
    if (step === 4) {
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
  }, [step, router]);

  const handleOpenSettings = useCallback(() => {
    Linking.openURL('App-Prefs:SAFARI');
  }, []);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaWrapper style={styles.container}>
      {/* Header navigation */}
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={handlePrev} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>前へ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {step >= 1 && step <= 3 && (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text style={[styles.headerSkipText, { color: colors.textSecondary }]}>あとで設定する</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Progress dots */}
        <View style={styles.stepIndicator}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                { backgroundColor: colors.surfaceHighlight },
                i === step && { backgroundColor: colors.primary, width: 24 },
                i < step && { backgroundColor: colors.primary },
              ]}
            />
          ))}
        </View>

        {/* Step 0 - Intro */}
        {step === 0 && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={80}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>ポルノブロッカー</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {'Safariでアダルトサイトを自動ブロック。\n3ステップで設定できます。'}
            </Text>
          </>
        )}

        {/* Step 1 - Settings > Apps > Safari */}
        {step === 1 && (
          <>
            <StepBadge step={1} />
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              「設定」→「アプリ」→「Safari」
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              設定アプリを開いて「アプリ」から「Safari」を選択してください
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[1]}
              highlight={STEP_HIGHLIGHTS[1]}
            />
          </>
        )}

        {/* Step 2 - Safari > Extensions */}
        {step === 2 && (
          <>
            <StepBadge step={2} />
            <Text style={[styles.stepTitle, { color: colors.text }]}>「機能拡張」をタップ</Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Safari設定の中にある「機能拡張」を選択してください
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[2]}
              highlight={STEP_HIGHLIGHTS[2]}
            />
          </>
        )}

        {/* Step 3 - Enable Rewire */}
        {step === 3 && (
          <>
            <StepBadge step={3} />
            <Text style={[styles.stepTitle, { color: colors.text }]}>Rewireをオンにする</Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              「rewire」を選んで「機能拡張を許可」をオンにしてください
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[3]}
              highlight={STEP_HIGHLIGHTS[3]}
            />
          </>
        )}

        {/* Step 4 - Completion */}
        {step === 4 && (
          <>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={colors.success}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>設定完了！</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {'Safariでアダルトサイトが\n自動的にブロックされます'}
            </Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 0 && (
          <Button title="セットアップを開始" onPress={handleNext} />
        )}

        {step === 1 && (
          <>
            <Button title="設定アプリを開く" onPress={handleOpenSettings} />
            <Button
              title="次へ"
              variant="secondary"
              onPress={handleNext}
              style={styles.secondaryButton}
            />
          </>
        )}

        {step === 2 && (
          <Button title="次へ" onPress={handleNext} />
        )}

        {step === 3 && (
          <>
            <Button title="設定を開く" onPress={handleOpenSettings} />
            <Button
              title="次へ"
              variant="secondary"
              onPress={handleNext}
              style={styles.secondaryButton}
            />
          </>
        )}

        {step === 4 && (
          <Button
            title="完了"
            onPress={handleNext}
            loading={isLoading}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  headerButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  headerSkipText: {
    fontSize: FONT_SIZE.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
});
