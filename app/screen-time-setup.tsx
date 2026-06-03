import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DeviceActivitySelectionSheetView } from 'react-native-device-activity';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { ScreenTimeSetupIntro } from '@/components/screen-time/ScreenTimeSetupIntro';
import { useScreenTimeSetup } from '@/hooks/screenTime/useScreenTimeSetup';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';

export default function ScreenTimeSetupScreen() {
  const router = useRouter();
  const {
    step,
    isLoading,
    pendingSelection,
    startSetup,
    handlePickerChange,
    finalizePicker,
    cancelPicker,
  } = useScreenTimeSetup();
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
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
            testID="screen-time-setup-done"
          >
            <Text style={styles.primaryButtonText}>
              {t('screenTime.done')}
            </Text>
          </TouchableOpacity>
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

  if (step === 'error') {
    return (
      <SafeAreaWrapper>
        {renderCloseHeader()}
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={64} color={colors.danger} />
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            {t('screenTime.errorTitle')}
          </Text>
          <Text style={[styles.completedDesc, { color: colors.textSecondary }]}>
            {t('screenTime.errorDescription')}
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
      {step === 'picking' && Platform.OS === 'ios' && (
        <View style={styles.pickerOverlay} testID="screen-time-picker-overlay">
          <DeviceActivitySelectionSheetView
            style={styles.pickerSheet}
            familyActivitySelection={pendingSelection?.familyActivitySelection ?? null}
            onSelectionChange={(event) => {
              const sel = event.nativeEvent.familyActivitySelection ?? '';
              const count =
                (event.nativeEvent.applicationCount ?? 0) +
                (event.nativeEvent.categoryCount ?? 0);
              handlePickerChange(sel, count);
            }}
            onDismissRequest={() => {
              if (pendingSelection) {
                void finalizePicker();
              } else {
                cancelPicker();
              }
            }}
          />
        </View>
      )}
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
  primaryButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerSheet: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
