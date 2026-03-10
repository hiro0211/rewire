import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {'ポルノをやめる、\n人生を変える'}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {'9つの質問に答えるだけ。\nあなたの依存度をチェックし、\n最適なプランを作成します。'}
        </Text>
        <Card variant="outlined" style={styles.privacyCard}>
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              すべての回答はこの端末内にのみ保存されます
            </Text>
          </View>
        </Card>
      </View>
      <Button title="始める" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
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
  privacyCard: {
    width: '100%',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
});
