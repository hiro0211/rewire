import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StepBadge } from '@/components/safari-setup/StepBadge';
import { ScreenshotStep } from '@/components/safari-setup/ScreenshotStep';
import { useUserStore } from '@/stores/userStore';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';

const TOTAL_STEPS = 7;

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

export default function SafariExtensionSetupScreen() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isPro = useUserStore((s) => s.user?.isPro ?? false) || __DEV__;

  const handleNext = useCallback(async () => {
    if (step === 6) {
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

  const handleUpgrade = useCallback(() => {
    router.push('/paywall');
  }, [router]);

  return (
    <SafeAreaWrapper style={styles.container}>
      {/* Header navigation */}
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={handlePrev} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            <Text style={styles.headerButtonText}>前へ</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
        {step >= 1 && step <= 5 && (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text style={styles.headerSkipText}>あとで設定する</Text>
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
                i === step && styles.stepDotActive,
                i < step && styles.stepDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step 0 - Intro */}
        {step === 0 && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={80}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Safari拡張機能</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.description}>
              {'アダルトサイトの自動ブロック\nと視聴時間の計測を行います\n4ステップで設定できます'}
            </Text>
            {!isPro && (
              <View style={styles.proGate}>
                <Ionicons name="lock-closed" size={24} color={COLORS.pro} />
                <Text style={styles.proGateText}>
                  この機能はPro限定です
                </Text>
              </View>
            )}
          </>
        )}

        {/* Step 1 - Settings > Apps > Safari */}
        {step === 1 && (
          <>
            <StepBadge step={1} />
            <Text style={styles.stepTitle}>
              「設定」→「アプリ」→「Safari」
            </Text>
            <Text style={styles.stepDescription}>
              設定アプリを開いて「アプリ」から「Safari」を選択してください
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[1]}
              highlight={STEP_HIGHLIGHTS[1]}
            />
          </>
        )}

        {/* Step 2 - Extensions */}
        {step === 2 && (
          <>
            <StepBadge step={2} />
            <Text style={styles.stepTitle}>「機能拡張」をタップ</Text>
            <Text style={styles.stepDescription}>
              Safari設定の中にある「機能拡張」を選択してください
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[2]}
              highlight={STEP_HIGHLIGHTS[2]}
            />
          </>
        )}

        {/* Step 3 - Enable Content Blocker */}
        {step === 3 && (
          <>
            <StepBadge step={3} />
            <Text style={styles.stepTitle}>
              「Rewire」のブロッカーをオンにする
            </Text>
            <Text style={styles.stepDescription}>
              コンテンツブロッカーを有効にするとアダルトサイトが自動ブロックされます
            </Text>
            <ScreenshotStep
              image={STEP_IMAGES[3]}
              highlight={STEP_HIGHLIGHTS[3]}
            />
          </>
        )}

        {/* Step 4 - Enable Web Extension */}
        {step === 4 && (
          <>
            <StepBadge step={4} />
            <Text style={styles.stepTitle}>
              「Rewire」の拡張機能を許可する
            </Text>
            <Text style={styles.stepDescription}>
              拡張機能を有効にすると視聴時間の自動計測が開始されます
            </Text>
            <View style={styles.screenshotPlaceholder}>
              <Text style={styles.screenshotPlaceholderText}>
                スクリーンショット準備中
              </Text>
            </View>
          </>
        )}

        {/* Step 5 - Allow All Websites */}
        {step === 5 && (
          <>
            <StepBadge step={5} />
            <Text style={styles.stepTitle}>
              「すべてのWebサイト」で「許可」を選択
            </Text>
            <Text style={styles.stepDescription}>
              すべてのWebサイトでの実行を許可してください
            </Text>
            <View style={styles.screenshotPlaceholder}>
              <Text style={styles.screenshotPlaceholderText}>
                スクリーンショット準備中
              </Text>
            </View>
          </>
        )}

        {/* Step 6 - Completion */}
        {step === 6 && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={COLORS.success}
              />
            </View>
            <Text style={styles.title}>設定完了！</Text>
            <Text style={styles.description}>
              {'Safariでアダルトサイトが\n自動的にブロックされ、\n視聴時間が計測されます'}
            </Text>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 0 && (
          <>
            {isPro ? (
              <Button title="セットアップを開始" onPress={handleNext} />
            ) : (
              <Button
                title="Proにアップグレード"
                onPress={handleUpgrade}
                style={styles.upgradeButton}
              />
            )}
          </>
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

        {step === 5 && (
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

        {step === 6 && (
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
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  headerSkipText: {
    color: COLORS.textSecondary,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  proBadge: {
    backgroundColor: COLORS.pro,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  proGate: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  proGateText: {
    color: COLORS.pro,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  screenshotPlaceholder: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 340,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotPlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
  upgradeButton: {
    backgroundColor: COLORS.pro,
  },
});
