import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function UsageEmptyState() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons
          name="bar-chart-outline"
          size={64}
          color={colors.textSecondary}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>データがありません</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {'チェックインを続けると\nここに統計が表示されます'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
});
