import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

export default function BreathingSuccessScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <Text style={styles.emoji}>🎊</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t('breathingSuccess.title', { nickname: user?.nickname || '' })}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t('breathingSuccess.message')}
        </Text>

        <Button
          title={t('breathingSuccess.continue')}
          onPress={() => router.replace('/(tabs)')}
          style={styles.button}
        />
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
  emoji: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  button: {
    width: '100%',
  },
});
