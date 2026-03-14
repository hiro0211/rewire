import { StarryBackground } from '@/components/onboarding/StarryBackground';
import {
  BRAND_CATCHPHRASES,
  BRAND_TIMING_CONFIG,
  calculateBrandTimings,
} from '@/constants/brandConfig';
import { FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ROUTES, routeWithParams } from '@/lib/routing/routes';
import { Animated, StyleSheet, View } from 'react-native';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASES.length);
const CHAR_INTERVAL = BRAND_TIMING_CONFIG.charInterval;

export function BrandScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const logoOpacity = useRef(new Animated.Value(0)).current;

  // 各行の各文字ごとに Animated.Value を生成
  const charOpacities = useRef(
    BRAND_CATCHPHRASES.map((phrase) =>
      [...phrase].map(() => new Animated.Value(0)),
    ),
  ).current;

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
      const chars = [...BRAND_CATCHPHRASES[lineIdx]];
      chars.forEach((_, charIdx) => {
        const charDelay = lineStart + charIdx * CHAR_INTERVAL;
        timeouts.push(setTimeout(() => {
          // 行の最初の文字でハプティクス
          if (charIdx === 0) {
            const style = lineIdx < BRAND_CATCHPHRASES.length - 1
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

    // Navigate
    timeouts.push(setTimeout(() => {
      if (!user || !user.nickname) {
        router.replace(ROUTES.onboarding);
      } else if (!user.isPro) {
        router.replace(routeWithParams('/paywall', { source: 'returning' }));
      } else {
        router.replace(ROUTES.streak);
      }
    }, TIMINGS.navigate));

    return () => timeouts.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StarryBackground
      twinkle={true}
      gradientColors={['#0A0A0F', '#1a1a3e', '#2d1b4e']}
    >
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
          {BRAND_CATCHPHRASES.map((phrase, lineIdx) => (
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
    fontWeight: 'bold',
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
    lineHeight: 28,
  },
});
