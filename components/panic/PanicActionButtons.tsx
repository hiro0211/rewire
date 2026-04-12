import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZE, RADIUS, LAYOUT } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';

interface PanicActionButtonsProps {
  onThinkingOfWatching: () => void;
  onWatchedPorn: () => void;
}

/**
 * Two stacked action buttons at the bottom of the panic screen. The user picks
 * one of them to declare their current state, which then routes to the
 * matching follow-up flow (breathing exercise or recovery).
 */
export function PanicActionButtons({
  onThinkingOfWatching,
  onWatchedPorn,
}: PanicActionButtonsProps) {
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Pressable
        testID="panic-action-thinking"
        onPress={onThinkingOfWatching}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={['#F87171', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.label}>{t('panic.thinkingOfWatching')}</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        testID="panic-action-watched"
        onPress={onWatchedPorn}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={['#1E3A8A', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.label}>{t('panic.watchedPorn')}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  pressable: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  button: {
    minHeight: LAYOUT.buttonHeight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
