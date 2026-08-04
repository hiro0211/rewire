import { StarryBackground } from '@/components/ui/StarryBackground';
import { ShootingStars } from '@/components/ui/ShootingStars';
import {
  BRAND_CATCHPHRASE_KEYS,
  BRAND_TIMING_CONFIG,
  calculateBrandTimings,
} from '@/constants/brandConfig';
import { FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePaywallStore } from '@/stores/paywallStore';
import { shouldShowLaunchPaywall } from '@/lib/paywall/launchPaywallCooldown';
import { PAYWALL_SOURCE } from '@/constants/analytics/paywallSource';
import { useLocaleStore } from '@/stores/localeStore';
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
  const localeHydrated = useLocaleStore((s) => s.hasHydrated);

  // Why: locale 確定前に catchphrase をマウントすると、useRef でキャプチャした文字数と
  // 後続レンダーの文字数がズレ、末尾の文字が opacity=undefined (=1) で先に可視化する。
  // 背景レイヤだけ先に出し、locale ハイドレーション完了後にアニメ本体をマウントする。
  return (
    <StarryBackground twinkle={true} gradientColors={['#0A0A0F', '#1a1a3e', '#2d1b4e']}>
      <ShootingStars />
      {localeHydrated && <BrandScreenAnimated />}
    </StarryBackground>
  );
}

function BrandScreenAnimated() {
  const router = useRouter();
  const { user } = useUserStore();
  const subscriptionSynced = useSubscriptionStore((s) => s.subscriptionSynced);
  const paywallCooldownHydrated = usePaywallStore((s) => s.hasHydrated);
  const { t } = useLocale();

  const catchphrases = BRAND_CATCHPHRASE_KEYS.map((key) => t(key));

  const logoOpacity = useRef(new Animated.Value(0)).current;

  // 各行の各文字ごとに Animated.Value を生成（locale 確定後の文字数で 1 回だけキャプチャ）
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
      const { lastShownAt, hasHydrated } = usePaywallStore.getState();
      // 未読込のまま判定すると「未記録＝表示する」と誤読して毎回出てしまう
      if (!hasHydrated) return;

      navigatedRef.current = true;
      if (shouldShowLaunchPaywall(lastShownAt, new Date())) {
        router.replace(routeWithParams('/paywall', { source: PAYWALL_SOURCE.RETURNING }));
      } else {
        router.replace(ROUTES.tabs);
      }
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
  }, [subscriptionSynced, user?.isPro, paywallCooldownHydrated, tryNavigate]);

  return (
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
