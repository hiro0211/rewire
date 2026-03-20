import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface ConsentStepProps {
  privacyAgreed: boolean;
  dataAgreed: boolean;
  onTogglePrivacy: () => void;
  onToggleData: () => void;
}

export function ConsentStep({
  privacyAgreed,
  dataAgreed,
  onTogglePrivacy,
  onToggleData,
}: ConsentStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.consent.title')}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('onboarding.consent.dataDescription')}
      </Text>
      <View style={styles.consentContainer}>
        <Text style={[styles.dataList, { color: colors.text }]}>
          {t('onboarding.consent.dataList')}
        </Text>
        <TouchableOpacity
          testID="checkbox-privacy"
          style={styles.checkboxRow}
          onPress={onTogglePrivacy}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: colors.textSecondary },
              privacyAgreed && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            {privacyAgreed && (
              <Ionicons name="checkmark" size={16} color={colors.contrastText} />
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            <Text
              testID="link-privacy-policy"
              style={[styles.linkText, { color: colors.cyan }]}
              onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#privacy')}
            >
              {t('onboarding.consent.privacyPolicy')}
            </Text>
            {t('onboarding.consent.privacyAgree')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="checkbox-terms"
          style={styles.checkboxRow}
          onPress={onToggleData}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: colors.textSecondary },
              dataAgreed && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            {dataAgreed && (
              <Ionicons name="checkmark" size={16} color={colors.contrastText} />
            )}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            <Text
              testID="link-terms"
              style={[styles.linkText, { color: colors.cyan }]}
              onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#terms')}
            >
              {t('onboarding.consent.termsOfService')}
            </Text>
            {t('onboarding.consent.dataAgree')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
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
  consentContainer: {
    width: '100%',
  },
  dataList: {
    fontSize: FONT_SIZE.md,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.md,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});
