import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { GOAL_OPTIONS } from '@/constants/goals';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { useUserStore } from '@/stores/userStore';
import { format } from 'date-fns';
import * as Crypto from 'expo-crypto';

export default function GoalSettingScreen() {
  const { nickname, consentGivenAt } = useLocalSearchParams<{
    nickname: string;
    consentGivenAt: string;
  }>();
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
      notifyEnabled: true,
      createdAt: new Date().toISOString(),
      consentGivenAt: Array.isArray(consentGivenAt) ? consentGivenAt[0] : consentGivenAt || null,
      ageVerifiedAt: null,
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

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGoal}
            onValueChange={(value) => setSelectedGoal(value)}
            itemStyle={styles.pickerItem}
          >
            {GOAL_OPTIONS.map((days) => (
              <Picker.Item key={days} label={`${days}日`} value={days} />
            ))}
          </Picker>
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
  pickerContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    color: COLORS.text,
    fontSize: 22,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
