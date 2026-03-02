import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={styles.container}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    textTransform: 'uppercase',
  },
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
  },
});
