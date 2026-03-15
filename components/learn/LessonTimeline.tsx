import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { LESSONS, type Lesson } from '@/constants/lessons';
import { LessonCard } from './LessonCard';

type LessonStatus = 'active' | 'locked' | 'completed';

interface LessonTimelineProps {
  completedLessons: string[];
  onLessonPress: (lesson: Lesson) => void;
}

function getLessonStatus(
  lesson: Lesson,
  completedLessons: string[],
): LessonStatus {
  if (completedLessons.includes(lesson.id)) return 'completed';
  if (lesson.number === 1) return 'active';
  const prevLesson = LESSONS.find((l) => l.number === lesson.number - 1);
  if (prevLesson && completedLessons.includes(prevLesson.id)) return 'active';
  return 'locked';
}

function getTimelineIcon(status: LessonStatus) {
  switch (status) {
    case 'completed':
      return 'checkmark-circle' as const;
    case 'active':
      return 'radio-button-on' as const;
    case 'locked':
      return 'lock-closed' as const;
  }
}

function getTimelineColor(status: LessonStatus, colors: { cyan: string; success: string; textSecondary: string }) {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'active':
      return colors.cyan;
    case 'locked':
      return colors.textSecondary;
  }
}

export function LessonTimeline({ completedLessons, onLessonPress }: LessonTimelineProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {LESSONS.map((lesson, index) => {
        const status = getLessonStatus(lesson, completedLessons);
        const iconName = getTimelineIcon(status);
        const iconColor = getTimelineColor(status, colors);
        const isLast = index === LESSONS.length - 1;

        return (
          <View key={lesson.id} style={styles.row}>
            <View style={styles.timelineColumn}>
              <View testID={`timeline-icon-${lesson.id}`}>
                <Ionicons name={iconName} size={20} color={iconColor} />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: colors.surfaceHighlight },
                  ]}
                />
              )}
            </View>
            <View style={styles.cardColumn}>
              <LessonCard
                lesson={lesson}
                status={status}
                onPress={() => onLessonPress(lesson)}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timelineColumn: {
    width: 20,
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: SPACING.xs,
  },
  cardColumn: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
});
