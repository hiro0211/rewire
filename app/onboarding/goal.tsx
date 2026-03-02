import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { GOAL_OPTIONS } from '@/constants/goals';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { StarryBackground } from '@/components/onboarding/StarryBackground';
import { useUserStore } from '@/stores/userStore';
import { notificationClient } from '@/lib/notifications/notificationClient';
import { format } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export default function GoalSettingScreen() {
  const { nickname, consentGivenAt, notifyTime: notifyTimeParam, lastViewedDate: lastViewedDateParam } = useLocalSearchParams<{
    nickname: string;
    consentGivenAt: string;
    notifyTime: string;
    lastViewedDate: string;
  }>();
  const [selectedGoal, setSelectedGoal] = useState(30);
  const { setUser } = useUserStore();
  const router = useRouter();
  const { colors } = useTheme();

  const resolvedNotifyTime = Array.isArray(notifyTimeParam)
    ? notifyTimeParam[0]
    : notifyTimeParam || '22:00';

  const resolvedLastViewedDate = Array.isArray(lastViewedDateParam)
    ? lastViewedDateParam[0]
    : lastViewedDateParam || null;

  const handleFinish = async () => {
    try {
      const newUser = {
        id: Crypto.randomUUID(),
        nickname: Array.isArray(nickname) ? nickname[0] : nickname || 'User',
        goalDays: selectedGoal,
        streakStartDate: resolvedLastViewedDate || format(new Date(), 'yyyy-MM-dd'),
        isPro: false,
        notifyTime: resolvedNotifyTime,
        notifyEnabled: true,
        createdAt: new Date().toISOString(),
        consentGivenAt: Array.isArray(consentGivenAt) ? consentGivenAt[0] : consentGivenAt || null,
        ageVerifiedAt: null,
      };

      await setUser(newUser);

      const granted = await notificationClient.requestPermissions();
      if (granted) {
        await notificationClient.scheduleDailyReminder(resolvedNotifyTime);
      }

      analyticsClient.logEvent('onboarding_complete', { goal_days: selectedGoal });
      router.replace({
        pathname: '/onboarding/benefits',
        params: {
          nickname: newUser.nickname,
          goalDays: String(selectedGoal),
          source: 'onboarding',
        },
      });
    } catch (error) {
      console.error('[Goal] handleFinish failed:', error);
    }
  };

  return (
    <StarryBackground>
      <SafeAreaWrapper style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>目標を設定</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            まずは何日間、ポルノなしで過ごすことを目指しますか？
          </Text>

          <View style={[styles.pickerContainer, { backgroundColor: colors.pillBackground }]}>
            <Picker
              selectedValue={selectedGoal}
              onValueChange={(value) => setSelectedGoal(value)}
              itemStyle={[styles.pickerItem, { color: colors.text }]}
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
    </StarryBackground>
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
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  pickerContainer: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    fontSize: 22,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
