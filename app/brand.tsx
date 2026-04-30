import { StarryBackground } from '@/components/onboarding/StarryBackground';
import { ShootingStars } from '@/components/ui/ShootingStars';
import {
  BRAND_CATCHPHRASE_KEYS,
  BRAND_TIMING_CONFIG,
  calculateBrandTimings,
} from '@/constants/brandConfig';
import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useLocale } from '@/hooks/useLocale';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { ROUTES, routeWithParams } from '@/lib/routing/routes';
import { Animated, StyleSheet, View } from 'react-native';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASE_KEYS.length);
const CHAR_INTERVAL = BRAND_TIMING_CONFIG.charInterval;
export const BRAND_HARD_TIMEOUT_MS = 7000;

export function BrandScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const subscriptionSynced = useSubscriptionStore((s) => s.subscriptionSynced);
  const { t } = useLocale();

  const catchphrases = BRAND_CATCHPHRASE_KEYS.map((key) => t(key));

  const logoOpacity = useRef(new Animated.Value(0)).current;

  // 各行の各文字ごとに Animated.Value を生成
  const charOpacities = useRef(
    catchphrases.map((phrase) =>
      [...phrase].map(() => new Animated.Value(0)),
    ),
  ).current;

  const navigatedRef = useRef(false);
  const animationDoneRef = useRef(false);

  const tryNavigate = useCallback(() => {
    if (navigatedRef.current) return;
    const freshUser = useUserStore.getState().user;
    const synced = useSubscriptionStore.getState().subscriptionSynced;
    if (!freshUser || !freshUser.nickname) {
      navigatedRef.current = true;
      router.replace(ROUTES.onboarding);
      return;
    }
    if (freshUser.isPro) {
      navigatedRef.current = true;
      router.replace(ROUTES.tabs);
      return;
    }
    if (synced) {
      navigatedRef.current = true;
      router.replace(routeWithParams('/paywall', { source: 'returning' }));
      return;
    }
    // 未同期 → 待機
  }, [router]);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Logo fade in
    timeouts.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: TIMINGS.lineAnimDuration,
        useNativeDriver: true,
      }).start();
    }, TIMINGS.logo));

    // タイプライター: 各行の各文字を順番に表示
    TIMINGS.lines.forEach((lineStart, lineIdx) => {
      const chars = [...catchphrases[lineIdx]];
      chars.forEach((_, charIdx) => {
        const charDelay = lineStart + charIdx * CHAR_INTERVAL;
        timeouts.push(setTimeout(() => {
          // 行の最初の文字でハプティクス
          if (charIdx === 0) {
            const style = lineIdx < catchphrases.length - 1
              ? Haptics.ImpactFeedbackStyle.Light
              : Haptics.ImpactFeedbackStyle.Medium;
            Haptics.impactAsync(style);
          }
          Animated.timing(charOpacities[lineIdx][charIdx], {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }).start();
        }, charDelay));
      });
    });

    // Animation end: attempt navigate; if subscription unsynced + user pending, wait.
    timeouts.push(setTimeout(() => {
      animationDoneRef.current = true;
      tryNavigate();
    }, TIMINGS.navigate));

    // Hard timeout fallback: never pin on paywall if sub sync never completes.
    timeouts.push(setTimeout(() => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      const freshUser = useUserStore.getState().user;
      if (!freshUser || !freshUser.nickname) {
        router.replace(ROUTES.onboarding);
      } else {
        router.replace(ROUTES.tabs);
      }
    }, BRAND_HARD_TIMEOUT_MS));

    return () => timeouts.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // sub sync / user.isPro 変化でアニメーション終了後に再判定
  useEffect(() => {
    if (animationDoneRef.current) {
      tryNavigate();
    }
  }, [subscriptionSynced, user?.isPro, tryNavigate]);

  return (
    <StarryBackground twinkle={true} gradientColors={['#0A0A0F', '#1a1a3e', '#2d1b4e']}>
      <ShootingStars />
      <View style={styles.content}>
        <Animated.Image
          source={require('@/assets/images/icon.png')}
          style={[styles.logoImage, { opacity: logoOpacity }]}
          resizeMode="contain"
          testID="brand-logo-image"
        />
        <Animated.Text style={[styles.logoText, { opacity: logoOpacity }]}>
          Rewire
        </Animated.Text>

        <View style={styles.catchphrases}>
          {catchphrases.map((phrase, lineIdx) => (
            <View
              key={lineIdx}
              style={styles.catchphraseLine}
              testID={`catchphrase-line-${lineIdx}`}
            >
              {[...phrase].map((char, charIdx) => (
                <Animated.Text
                  key={charIdx}
                  style={[
                    styles.catchphrase,
                    { opacity: charOpacities[lineIdx][charIdx] },
                  ]}
                >
                  {char}
                </Animated.Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    </StarryBackground>
  );
}

export default BrandScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: FONT_WEIGHT.bold,
    color: '#E8E8ED',
    letterSpacing: 2,
    marginBottom: 32,
  },
  catchphrases: {
    alignItems: 'center',
    gap: 8,
  },
  catchphraseLine: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  catchphrase: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(232, 232, 237, 0.85)',
    lineHeight: LINE_HEIGHT.lg,
  },
});
