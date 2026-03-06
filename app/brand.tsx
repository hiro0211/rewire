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
import { Animated, StyleSheet, View } from 'react-native';

const TIMINGS = calculateBrandTimings(BRAND_TIMING_CONFIG, BRAND_CATCHPHRASES.length);

export function BrandScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const lineOpacities = useRef(BRAND_CATCHPHRASES.map(() => new Animated.Value(0))).current;
  const lineTranslates = useRef(BRAND_CATCHPHRASES.map(() => new Animated.Value(20))).current;

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

    // Catchphrase lines
    TIMINGS.lines.forEach((timing, index) => {
      timeouts.push(setTimeout(() => {
        const style = index < 2
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium;
        Haptics.impactAsync(style);
        Animated.parallel([
          Animated.timing(lineOpacities[index], {
            toValue: 1,
            duration: TIMINGS.lineAnimDuration,
            useNativeDriver: true,
          }),
          Animated.timing(lineTranslates[index], {
            toValue: 0,
            duration: TIMINGS.lineAnimDuration,
            useNativeDriver: true,
          }),
        ]).start();
      }, timing));
    });

    // Navigate
    timeouts.push(setTimeout(() => {
      let destination: string;
      if (!user || !user.nickname) {
        destination = '/onboarding';
      } else if (!user.isPro) {
        destination = '/paywall?source=onboarding';
      } else {
        destination = '/streak';
      }
      router.replace(destination as any);
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
          {BRAND_CATCHPHRASES.map((phrase, index) => (
            <Animated.Text
              key={phrase}
              style={[
                styles.catchphrase,
                {
                  opacity: lineOpacities[index],
                  transform: [{ translateY: lineTranslates[index] }],
                },
              ]}
            >
              {phrase}
            </Animated.Text>
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
  catchphrase: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(232, 232, 237, 0.85)',
    textAlign: 'center',
    lineHeight: 28,
  },
});
