import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { useBreathStore } from '@/stores/breathStore';
import { useUserStore } from '@/stores/userStore';
import * as Crypto from 'expo-crypto';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export default function BreathingAskScreen() {
  const router = useRouter();
  const { addSession } = useBreathStore();
  const { user } = useUserStore();

  const handleResponse = async (resolved: boolean) => {
    analyticsClient.logEvent('breathing_completed', { urge_resolved: resolved });
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
        <Text style={styles.question}>誘惑は落ち着きましたか？</Text>
        
        <View style={styles.buttonGroup}>
          <Button
            title="はい"
            onPress={() => handleResponse(true)}
            style={styles.button}
          />
          <View style={{ height: SPACING.md }} />
          <Button
            title="いいえ（もう一度）"
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
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    fontWeight: '600',
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
