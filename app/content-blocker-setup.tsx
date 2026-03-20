import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StepBadge } from '@/components/content-blocker/StepBadge';
import { ScreenshotStep } from '@/components/content-blocker/ScreenshotStep';
import { SetupIntro } from '@/components/content-blocker/SetupIntro';
import { SetupCompletion } from '@/components/content-blocker/SetupCompletion';
import { useContentBlockerSetup } from '@/hooks/contentBlocker/useContentBlockerSetup';
import { useLocale } from '@/hooks/useLocale';

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

const SCREENSHOT_STEP_KEYS = [
  { step: 1, titleKey: 'contentBlocker.step1Title', descKey: 'contentBlocker.step1Desc' },
  { step: 2, titleKey: 'contentBlocker.step2Title', descKey: 'contentBlocker.step2Desc' },
  { step: 3, titleKey: 'contentBlocker.step3Title', descKey: 'contentBlocker.step3Desc' },
] as const;

export default function ContentBlockerSetupScreen() {
  const { step, isLoading, handleNext, handlePrev, handleBack, handleOpenSettings } =
    useContentBlockerSetup();
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={handlePrev} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>{t('contentBlocker.prev')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {step >= 1 && step <= 3 && (
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text style={[styles.headerSkipText, { color: colors.textSecondary }]}>{t('contentBlocker.skipSetup')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
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

        {step === 0 && <SetupIntro />}

        {step >= 1 && step <= 3 && (() => {
          const config = SCREENSHOT_STEP_KEYS[step - 1];
          return (
            <>
              <StepBadge step={config.step} />
              <Text style={[styles.stepTitle, { color: colors.text }]}>{t(config.titleKey)}</Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{t(config.descKey)}</Text>
              <ScreenshotStep
                image={STEP_IMAGES[config.step]}
                highlight={STEP_HIGHLIGHTS[config.step]}
              />
            </>
          );
        })()}

        {step === 4 && <SetupCompletion />}
      </View>

      <View style={styles.footer}>
        {step === 0 && <Button title={t('contentBlocker.startSetup')} onPress={handleNext} />}
        {(step === 1 || step === 3) && (
          <>
            <Button title={step === 1 ? t('contentBlocker.openSettings') : t('contentBlocker.openSettingsShort')} onPress={handleOpenSettings} />
            <Button title={t('common.next')} variant="secondary" onPress={handleNext} style={styles.secondaryButton} />
          </>
        )}
        {step === 2 && <Button title={t('common.next')} onPress={handleNext} />}
        {step === 4 && <Button title={t('common.done')} onPress={handleNext} loading={isLoading} />}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  headerButton: { flexDirection: 'row', alignItems: 'center', minWidth: 44, minHeight: 44 },
  headerButtonText: { fontSize: FONT_SIZE.md, fontWeight: '500' },
  headerSkipText: { fontSize: FONT_SIZE.sm },
  content: { flex: 1, justifyContent: 'flex-start', alignItems: 'center' },
  stepIndicator: { flexDirection: 'row', marginTop: SPACING.xxl, marginBottom: SPACING.xxl },
  stepDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  stepTitle: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', textAlign: 'center', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  stepDescription: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.lg },
  footer: { marginBottom: SPACING.xl },
  secondaryButton: { marginTop: SPACING.sm },
});
