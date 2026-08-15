import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThankYouStep } from '@/components/postPurchaseOnboarding/ThankYouStep';
import { ScreenTimeIntroStep } from '@/components/postPurchaseOnboarding/ScreenTimeIntroStep';
import { DataProtectionStep } from '@/components/postPurchaseOnboarding/DataProtectionStep';
import { ScreenTimePermissionStep } from '@/components/postPurchaseOnboarding/ScreenTimePermissionStep';
import { BlockerActivationStep } from '@/components/postPurchaseOnboarding/BlockerActivationStep';
import { CompleteStep } from '@/components/postPurchaseOnboarding/CompleteStep';
import { usePostPurchaseFlow } from '@/hooks/postPurchaseOnboarding/usePostPurchaseFlow';
import {
  POST_PURCHASE_STEPS,
  TOTAL_POST_PURCHASE_STEPS,
} from '@/constants/postPurchaseOnboarding';
import { ROUTES } from '@/lib/routing/routes';
import { trackEvent } from '@/lib/tracking/trackEvent';

const TRANSITION_DURATION = 150;
const SLIDE_DISTANCE = 300;

export default function PostPurchaseOnboardingScreen() {
  const router = useRouter();
  const flow = usePostPurchaseFlow();
  const translateX = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const { t } = useLocale();

  const { step, logStepViewed } = flow;

  useEffect(() => {
    logStepViewed(POST_PURCHASE_STEPS[step]);
  }, [step, logStepViewed]);

  const animateTransition = (direction: number, after: () => void) => {
    Animated.timing(translateX, {
      toValue: direction * SLIDE_DISTANCE,
      duration: TRANSITION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(direction * -SLIDE_DISTANCE);
      after();
      Animated.timing(translateX, {
        toValue: 0,
        duration: TRANSITION_DURATION,
        useNativeDriver: true,
      }).start();
    });
  };

  const { goToNext, markCompleted } = flow;

  const handleAdvance = () => {
    // 完了フラグはここでは立てない。最終ステップに到達して初めて完了扱いにする
    // ことで、途中で中断してもフローに戻れるようにする。
    animateTransition(-1, () => goToNext());
  };

  const handleSkip = async () => {
    trackEvent('post_purchase_onboarding_skipped', { from_step: step });
    await markCompleted();
    router.replace(ROUTES.tabs);
  };

  const handleFinishComplete = async () => {
    // 全ステップ完了時に初めて完了フラグを永続化する。
    await markCompleted();
    router.replace(ROUTES.tabs);
  };

  return (
    <AuroraBackground>
      <StarryOverlay />
      <SafeAreaWrapper style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            {step < TOTAL_POST_PURCHASE_STEPS - 1 ? (
              <TouchableOpacity
                onPress={handleSkip}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="post-purchase-skip-button"
              >
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                  {t('common.skip')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>
          <ProgressBar
            progress={(step + 1) / TOTAL_POST_PURCHASE_STEPS}
            height={4}
            variant="gradient"
          />
        </View>

        <Animated.View style={[styles.content, { transform: [{ translateX }] }]}>
          {step === 0 && <ThankYouStep onNext={handleAdvance} />}
          {step === 1 && <ScreenTimeIntroStep onNext={handleAdvance} />}
          {step === 2 && <DataProtectionStep onNext={handleAdvance} />}
          {step === 3 && <ScreenTimePermissionStep onComplete={handleAdvance} />}
          {step === 4 && <BlockerActivationStep onComplete={handleAdvance} />}
          {step === 5 && <CompleteStep onFinish={handleFinishComplete} />}
        </Animated.View>
      </SafeAreaWrapper>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerSpacer: {
    minWidth: 40,
  },
  skipText: {
    fontSize: FONT_SIZE.sm,
  },
  content: {
    flex: 1,
  },
});
