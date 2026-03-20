import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

interface SubscriptionTermsProps {
  trialText?: string;
}

export function SubscriptionTerms({ trialText }: SubscriptionTermsProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.legalText, { color: colors.textSecondary }]}>
        {trialText ? `${trialText}\n` : ''}
        {t('paywall.autoRenew')}
      </Text>
      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#terms')}>
          <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>{t('paywall.termsLink')}</Text>
        </TouchableOpacity>
        <Text style={[styles.legalSeparator, { color: colors.textSecondary }]}>|</Text>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#privacy')}>
          <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>{t('paywall.privacyLink')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  legalText: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  legalLinkText: {
    fontSize: FONT_SIZE.xs,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: FONT_SIZE.xs,
    marginHorizontal: SPACING.xs,
  },
});
