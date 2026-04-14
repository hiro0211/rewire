import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

export function SOSButton() {
  const router = useRouter();
  const { colors, gradients, glow } = useTheme();
  const { t } = useLocale();

  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 }),
      ),
      -1,
      false,
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
    };
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, SPRING_CONFIG);
  };

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    analyticsClient.logEvent('panic_button_tapped');
    router.push('/panic');
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, containerStyle]}>
      <Animated.View
        style={[
          styles.pulse,
          { backgroundColor: glow.cyan },
          pulseStyle,
        ]}
        pointerEvents="none"
      />
      <Pressable
        testID="panic-button"
        style={[styles.container, { shadowColor: glow.cyan, borderColor: 'rgba(0, 212, 255, 0.3)' }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[...gradients.sos]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="warning" size={20} color={colors.contrastText} />
          </View>
          <Text style={[styles.text, { color: colors.contrastText }]}>{t('sos.feelingUrge')}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'stretch',
  },
  pulse: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: RADIUS.lg + 6,
  },
  container: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md,
  },
});
