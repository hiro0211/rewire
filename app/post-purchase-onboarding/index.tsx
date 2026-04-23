import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING } from '@/constants/theme';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StarryOverlay } from '@/components/ui/StarryOverlay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThankYouStep } from '@/components/postPurchaseOnboarding/ThankYouStep';
import { SafariSetupStep } from '@/components/postPurchaseOnboarding/SafariSetupStep';
import { DemoStep } from '@/components/postPurchaseOnboarding/DemoStep';
import { usePostPurchaseFlow } from '@/hooks/postPurchaseOnboarding/usePostPurchaseFlow';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import { TOTAL_POST_PURCHASE_STEPS } from '@/constants/postPurchaseOnboarding';
import { ROUTES } from '@/lib/routing/routes';

const TRANSITION_DURATION = 150;
const SLIDE_DISTANCE = 300;

export default function PostPurchaseOnboardingScreen() {
  const router = useRouter();
  const flow = usePostPurchaseFlow();
  const translateX = useRef(new Animated.Value(0)).current;
  const [blockFired, setBlockFired] = useState<boolean | null>(null);
  const lastDemoOpenAtRef = useRef<number | null>(null);

  const { safariAlreadyEnabled, step, goToStep, logStepViewed } = flow;

  useEffect(() => {
    if (safariAlreadyEnabled && step === 0) {
      goToStep(2);
    }
  }, [safariAlreadyEnabled, step, goToStep]);

  useEffect(() => {
    const stepName = step === 0 ? 'thankYou' : step === 1 ? 'safariSetup' : 'demo';
    logStepViewed(stepName);
  }, [step, logStepViewed]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      if (step !== 2) return;
      if (lastDemoOpenAtRef.current == null) return;
      try {
        const status = await safariWebExtensionBridge.getExtensionStatus();
        if (status.lastActiveAt && status.lastActiveAt * 1000 >= lastDemoOpenAtRef.current) {
          setBlockFired(true);
        } else {
          setBlockFired(false);
        }
      } catch {
        setBlockFired(false);
      }
    });
    return () => sub.remove();
  }, [step]);

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

  const { goToNext, markCompleted, logEvent } = flow;

  const handleAdvance = () => {
    animateTransition(-1, () => goToNext());
  };

  const handleSafariComplete = () => {
    animateTransition(-1, () => goToNext());
  };

  const handleTestBlock = async () => {
    logEvent('safari_demo_tapped');
    lastDemoOpenAtRef.current = Date.now();
    setBlockFired(null);
    await markCompleted();
  };

  const handleSkipDemo = async () => {
    logEvent('safari_demo_skipped');
    await markCompleted();
    router.replace(ROUTES.tabs);
  };

  return (
    <AuroraBackground>
      <StarryOverlay />
      <SafeAreaWrapper style={styles.container}>
        <View style={styles.header}>
          <ProgressBar
            progress={(step + 1) / TOTAL_POST_PURCHASE_STEPS}
            height={4}
            variant="gradient"
          />
        </View>

        <Animated.View style={[styles.content, { transform: [{ translateX }] }]}>
          {step === 0 && <ThankYouStep onNext={handleAdvance} />}
          {step === 1 && <SafariSetupStep onComplete={handleSafariComplete} />}
          {step === 2 && (
            <DemoStep
              onTestBlock={handleTestBlock}
              onSkip={handleSkipDemo}
              showRetryHint={blockFired === false}
            />
          )}
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
  content: {
    flex: 1,
    width: '100%',
  },
});
