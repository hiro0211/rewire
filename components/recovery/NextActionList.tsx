import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

export function NextActionList() {
  const router = useRouter();

  const ACTIONS = [
    { title: '深呼吸をして落ち着く', route: '/breathing' as const, icon: '🌬️' },
    { title: '記事を読んで学ぶ', route: '/(tabs)/articles' as const, icon: '📖' },
    { title: 'ホームに戻る', route: '/(tabs)' as const, icon: '🏠' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>次にどうする？</Text>
      {ACTIONS.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(action.route)}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.text}>{action.title}</Text>
            <Text style={styles.arrow}>→</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
  },
});
