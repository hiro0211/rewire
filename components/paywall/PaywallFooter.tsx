import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FONT_SIZE, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SubscriptionTerms } from './SubscriptionTerms';

interface PaywallFooterProps {
  onRestore: () => void;
  purchasing: boolean;
  trialText?: string;
}

export function PaywallFooter({ onRestore, purchasing, trialText }: PaywallFooterProps) {
  const { colors } = useTheme();

  return (
    <>
      <SubscriptionTerms trialText={trialText} />
      <TouchableOpacity onPress={onRestore} disabled={purchasing}>
        <Text style={[styles.restoreText, { color: colors.textSecondary }]}>
          購入の復元
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  restoreText: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
});
