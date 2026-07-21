import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, } from '@/constants/theme';
import { useBreathStore } from '@/stores/breathStore';
import { useUserStore } from '@/stores/userStore';
import * as Crypto from 'expo-crypto';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { trackActivation, type ActivationPath } from '@/lib/tracking/activation';

const ACTIVATION_PATHS: readonly ActivationPath[] = ['sos', 'quick_action', 'onboarding'];

function toActivationPath(source: string | undefined): ActivationPath {
  return ACTIVATION_PATHS.includes(source as ActivationPath)
    ? (source as ActivationPath)
    : 'other';
}

export default function BreathingAskScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { addSession } = useBreathStore();
  const { user } = useUserStore();
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleResponse = async (resolved: boolean) => {
    analyticsClient.logEvent('breathing_completed', { urge_resolved: resolved });
    // Completing a breathing session is the activation milestone — the first
    // time the app actually delivered its core value. Fires once per user.
    void trackActivation(toActivationPath(source));
    if (user) {
        await addSession({
            id: Crypto.randomUUID(),
            userId: user.id,
            totalCycles: 1, // Simplified for MVP
            urgeResolved: resolved,
            createdAt: new Date().toISOString(),
        });
    }

    if (resolved) {
      router.replace('/breathing/success');
    } else {
      // Retry
      router.replace('/breathing');
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <Text style={[styles.question, { color: colors.text }]}>{t('breathing.askCalmedDown')}</Text>

        <View style={styles.buttonGroup}>
          <Button
            title={t('common.yes')}
            onPress={() => handleResponse(true)}
            style={styles.button}
          />
          <View style={{ height: SPACING.md }} />
          <Button
            title={t('breathing.noTryAgain')}
            onPress={() => handleResponse(false)}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  question: {
    fontSize: FONT_SIZE.xl,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    fontWeight: FONT_WEIGHT.semibold,
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
