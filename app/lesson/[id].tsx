import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import { LessonContent } from '@/components/learn/LessonContent';
import { useLearnStore } from '@/stores/learnStore';
import { useTheme } from '@/hooks/useTheme';
import { LESSONS } from '@/constants/lessons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { completeLesson, isCompleted } = useLearnStore();

  const lesson = LESSONS.find((l) => l.id === id);

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          レッスンが見つかりません
        </Text>
      </SafeAreaView>
    );
  }

  const completed = isCompleted(lesson.id);

  const handleComplete = async () => {
    await completeLesson(lesson.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
          Lesson {lesson.number}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {lesson.title}
        </Text>

        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {lesson.readMinutes}分で読めます
          </Text>
        </View>

        <LessonContent content={lesson.content} />

        <View style={styles.buttonContainer}>
          {completed ? (
            <Button
              title="もう一度読む"
              onPress={() => router.back()}
              variant="secondary"
            />
          ) : (
            <Button
              title="レッスン完了"
              onPress={handleComplete}
              variant="gradient"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SPACING.screenPadding,
    paddingBottom: 100,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
  },
  buttonContainer: {
    marginTop: SPACING.xxxl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.xxxl,
  },
});
