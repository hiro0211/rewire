import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SubscriptionTermsProps {
  trialText?: string;
}

export function SubscriptionTerms({ trialText }: SubscriptionTermsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.legalText, { color: colors.textSecondary }]}>
        {trialText ? `${trialText}\n` : ''}
        サブスクリプションは期間終了の24時間前までにキャンセルしない限り自動更新されます。{'\n'}
        お支払いはApple IDに請求されます。
      </Text>
      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#terms')}>
          <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>利用規約</Text>
        </TouchableOpacity>
        <Text style={[styles.legalSeparator, { color: colors.textSecondary }]}>|</Text>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://hiro0211.github.io/rewire-support/#privacy')}>
          <Text style={[styles.legalLinkText, { color: colors.textSecondary }]}>プライバシーポリシー</Text>
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
