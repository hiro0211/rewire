import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { LessonTimeline } from '@/components/learn/LessonTimeline';
import { useLearnStore } from '@/stores/learnStore';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { LESSONS, type Lesson } from '@/constants/lessons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function LearnScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { completedLessons, loadProgress, resetProgress, isUnlocked } = useLearnStore();

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const handleLessonPress = (lesson: Lesson) => {
    if (!isUnlocked(lesson)) return;
    router.push(`/lesson/${lesson.id}`);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('learn.resetAll'),
      t('learn.resetConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('learn.reset'),
          style: 'destructive',
          onPress: () => resetProgress(),
        },
      ],
    );
  };

  return (
    <SafeAreaWrapper edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t('learn.title')}</Text>

        <View style={styles.progressSection}>
          <LessonProgressBar
            completed={completedLessons.length}
            total={LESSONS.length}
          />
        </View>

        <LessonTimeline
          completedLessons={completedLessons}
          onLessonPress={handleLessonPress}
        />

        {completedLessons.length > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>
              {t('learn.resetAll')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.screenPadding,
    paddingBottom: 100,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  progressSection: {
    marginBottom: SPACING.xl,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  resetText: {
    fontSize: FONT_SIZE.sm,
  },
});
