import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/stores/userStore';
import { FONT_SIZE } from '@/constants/theme';

export const BRAND_CATCHPHRASES = [
  '変わる覚悟はあるか。',
  '自分を取り戻す旅が、',
  '今、始まる。',
];

const TIMINGS = {
  logo: 300,
  line1: 900,
  line2: 1500,
  line3: 2100,
  navigate: 2800,
};

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
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, TIMINGS.logo));

    // Catchphrase lines
    const lineTimings = [TIMINGS.line1, TIMINGS.line2, TIMINGS.line3];
    lineTimings.forEach((timing, index) => {
      timeouts.push(setTimeout(() => {
        const style = index < 2
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium;
        Haptics.impactAsync(style);
        Animated.parallel([
          Animated.timing(lineOpacities[index], {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(lineTranslates[index], {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, timing));
    });

    // Navigate
    timeouts.push(setTimeout(() => {
      const destination = user && user.nickname ? '/(tabs)' : '/onboarding';
      router.replace(destination as any);
    }, TIMINGS.navigate));

    return () => timeouts.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1a1a3e', '#2d1b4e']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, { opacity: logoOpacity }]}>
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
    </LinearGradient>
  );
}

export default BrandScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
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
