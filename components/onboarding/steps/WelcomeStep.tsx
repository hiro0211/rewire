import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface WelcomeStepProps {
  onStart: () => void;
}

const STAR_COUNT = 5;
const STAR_COLOR = '#FFD700';

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          testID="rewire-logo"
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
        />
        <Text style={[styles.appName, { color: colors.text }]}>
          Rewire
        </Text>

        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.welcome.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('onboarding.welcome.description')}
        </Text>

        <View testID="star-rating" style={styles.starRow}>
          <Text style={styles.laurelLeft}>🌿</Text>
          {Array.from({ length: STAR_COUNT }).map((_, i) => (
            <Ionicons key={i} name="star" size={20} color={STAR_COLOR} />
          ))}
          <Text style={styles.laurelRight}>🌿</Text>
        </View>
      </View>
      <Button title={t('onboarding.welcome.startButton')} onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  laurelLeft: {
    fontSize: 20,
    transform: [{ scaleX: -1 }],
  },
  laurelRight: {
    fontSize: 20,
  },
});
