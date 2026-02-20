import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface AssessmentIntroStepProps {
  onStart: () => void;
}

export function AssessmentIntroStep({ onStart }: AssessmentIntroStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {'あなたの習慣を\n数値化します'}
        </Text>

        <Text style={styles.description}>
          {'9つの質問に答えてください。\n科学的な指標に基づいて、\nあなたの現在地を把握します。'}
        </Text>

        <Card variant="outlined" style={styles.privacyCard}>
          <View style={styles.privacyRow}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.privacyText}>
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
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
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
    color: COLORS.textSecondary,
    flex: 1,
  },
});
