import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { ScreenTimeSetupIntro } from '@/components/screen-time/ScreenTimeSetupIntro';
import { useScreenTimeSetup } from '@/hooks/screenTime/useScreenTimeSetup';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';

export default function ScreenTimeSetupScreen() {
  const router = useRouter();
  const { step, isLoading, startSetup } = useScreenTimeSetup();
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleSkip = useCallback(() => {
    router.back();
  }, [router]);

  const renderCloseHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        testID="screen-time-setup-close"
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  if (step === 'completed') {
    return (
      <SafeAreaWrapper>
        {renderCloseHeader()}
        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={64} color="#3DD68C" />
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            {t('screenTime.completionTitle')}
          </Text>
          <Text style={[styles.completedDesc, { color: colors.textSecondary }]}>
            {t('screenTime.completionDescription')}
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (step === 'denied') {
    return (
      <SafeAreaWrapper>
        {renderCloseHeader()}
        <View style={styles.center}>
          <Ionicons name="close-circle" size={64} color={colors.danger} />
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            {t('screenTime.deniedTitle')}
          </Text>
          <Text style={[styles.completedDesc, { color: colors.textSecondary }]}>
            {t('screenTime.deniedDescription')}
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScreenTimeSetupIntro
        onEnable={startSetup}
        onSkip={handleSkip}
        isLoading={isLoading}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  completedTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  completedDesc: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.body,
  },
});
