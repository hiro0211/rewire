import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function SetupIntro() {
  const { colors } = useTheme();

  return (
    <>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="shield-checkmark-outline" size={80} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>ポルノブロッカー</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {'Safariでアダルトサイトを自動ブロック。\n3ステップで設定できます。'}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
});
