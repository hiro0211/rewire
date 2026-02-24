import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface FeatureIntroStepProps {
  variant: 'recording' | 'breathing';
}

// --- Recording Illustration ---

function RecordingIllustration() {
  return (
    <View testID="recording-illustration" style={illStyles.recordingContainer}>
      {/* Streak Card */}
      <View style={illStyles.streakCard}>
        <Text style={illStyles.streakLabel}>現在の記録</Text>
        <View style={illStyles.streakRow}>
          <Text style={illStyles.streakNumber}>0</Text>
          <Text style={illStyles.streakUnit}>Days</Text>
        </View>
        <Text style={illStyles.goalText}>目標: 7日</Text>
        <View style={illStyles.progressRow}>
          <View style={illStyles.progressBarWrapper}>
            <ProgressBar progress={0} height={6} />
          </View>
          <Text style={illStyles.percentText}>0%</Text>
        </View>
      </View>

      {/* Today's Review */}
      <View style={illStyles.reviewCard}>
        <View style={illStyles.reviewRow}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={illStyles.reviewLabel}>今日の振り返り</Text>
        </View>
        <Text style={illStyles.reviewStatus}>完了済み</Text>
      </View>

      {/* Weekly Summary */}
      <View style={illStyles.summaryCard}>
        <Text style={illStyles.summaryLabel}>週間サマリー</Text>
        <View style={illStyles.summaryRow}>
          <Text style={illStyles.summaryValue}>1/1</Text>
          <Text style={illStyles.summaryUnit}>日間クリア</Text>
        </View>
      </View>
    </View>
  );
}

// --- Breathing Illustration ---

function BreathingIllustration() {
  return (
    <View testID="breathing-illustration" style={illStyles.breathingContainer}>
      {/* Concentric circles */}
      <View style={illStyles.circleOuter}>
        <View style={illStyles.circleMiddle}>
          <View style={illStyles.circleInner} />
        </View>
      </View>

      {/* SOS-style breathing button */}
      <View style={illStyles.breathButton}>
        <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
        <Text style={illStyles.breathButtonText}>深呼吸</Text>
      </View>
    </View>
  );
}

// --- Main Component ---

export function FeatureIntroStep({ variant }: FeatureIntroStepProps) {
  const isRecording = variant === 'recording';
  const isBreathing = variant === 'breathing';

  const title = isRecording
    ? '毎日の記録が\nあなたの力になる'
    : isBreathing
      ? '衝動が来たら、深呼吸'
      : '';

  const body = isRecording
    ? '1日1回の振り返りで、ポルノを見なかった日数や衝動の変化を記録。自分の成長が数字で見えるようになります。'
    : isBreathing
      ? '衝動を感じたとき、ホーム画面の「深呼吸」ボタンをタップ。6秒吸って6秒吐く呼吸法で、衝動が和らぎます。'
      : '';

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {isRecording && <RecordingIllustration />}
        {isBreathing && <BreathingIllustration />}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

// --- Main Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  body: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// --- Illustration Styles ---

const illStyles = StyleSheet.create({
  // Recording
  recordingContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakCard: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  streakNumber: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  streakUnit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  goalText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: SPACING.sm,
  },
  progressBarWrapper: {
    flex: 1,
  },
  percentText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  reviewCard: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reviewLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
  },
  reviewStatus: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
  },
  summaryCard: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryUnit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  // Breathing
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}40`,
  },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  breathButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
