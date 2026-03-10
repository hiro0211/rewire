import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface PaywallCloseButtonProps {
  onPress: () => void;
}

export function PaywallCloseButton({ onPress }: PaywallCloseButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      testID="close-button"
      style={[styles.button, { backgroundColor: colors.surfaceHighlight }]}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Text style={[styles.text, { color: colors.textSecondary }]}>✕</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FONT_SIZE.md,
  },
});
