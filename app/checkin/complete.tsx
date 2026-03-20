import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE } from '@/constants/theme';

export default function CheckinCompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <Text style={styles.emoji}>👍</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t('checkinComplete.title')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('checkinComplete.message')}
        </Text>
        <Button
          title={t('checkinComplete.goHome')}
          onPress={handleGoHome}
          style={styles.button}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  button: {
    width: '100%',
  },
});
