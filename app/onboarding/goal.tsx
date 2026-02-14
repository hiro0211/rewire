import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ToggleButton } from '@/components/ui/ToggleButton';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { useUserStore } from '@/stores/userStore';
import { format } from 'date-fns';
import * as Crypto from 'expo-crypto';

const GOAL_OPTIONS = [7, 14, 30, 90];

export default function GoalSettingScreen() {
  const { nickname, consentGivenAt, ageVerifiedAt } = useLocalSearchParams<{
    nickname: string;
    consentGivenAt: string;
    ageVerifiedAt: string;
  }>();
  // Default to 30 if undefined
  const [selectedGoal, setSelectedGoal] = useState(30);
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleFinish = async () => {
    const newUser = {
      id: Crypto.randomUUID(),
      nickname: Array.isArray(nickname) ? nickname[0] : nickname || 'User',
      goalDays: selectedGoal,
      streakStartDate: format(new Date(), 'yyyy-MM-dd'),
      isPro: false,
      notifyTime: '22:00',
      notifyEnabled: true, // Assuming enabled for MVP flow
      createdAt: new Date().toISOString(),
      consentGivenAt: Array.isArray(consentGivenAt) ? consentGivenAt[0] : consentGivenAt || null,
      ageVerifiedAt: Array.isArray(ageVerifiedAt) ? ageVerifiedAt[0] : ageVerifiedAt || null,
    };

    await setUser(newUser);
    router.replace({ pathname: '/paywall', params: { source: 'onboarding' } });
  };

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>目標を設定</Text>
        <Text style={styles.description}>
          まずは何日間、ポルノなしで過ごすことを目指しますか？
        </Text>

        <View style={styles.optionsGrid}>
          {GOAL_OPTIONS.map((days) => (
            <View key={days} style={styles.optionWrapper}>
              <ToggleButton
                title={`${days}日`}
                active={selectedGoal === days}
                onPress={() => setSelectedGoal(days)}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="開始する" onPress={handleFinish} />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  optionWrapper: {
    width: '45%',
    margin: SPACING.xs,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
