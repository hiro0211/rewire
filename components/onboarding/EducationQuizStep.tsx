import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import type { QuizQuestion } from '@/constants/education';

interface EducationQuizStepProps {
  quiz: QuizQuestion;
  onAnswered: () => void;
}

export function EducationQuizStep({ quiz, onAnswered }: EducationQuizStepProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const explanationOpacity = useRef(new Animated.Value(0)).current;

  const isCorrect = selectedValue === quiz.correctValue;

  const handleSelect = (value: string) => {
    if (locked) return;

    setSelectedValue(value);
    setLocked(true);

    if (value === quiz.correctValue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Fade in explanation
    Animated.timing(explanationOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    onAnswered();
  };

  const getOptionStyle = (value: string) => {
    if (!locked) {
      return styles.option;
    }

    if (value === quiz.correctValue) {
      return [styles.option, styles.optionCorrect];
    }

    if (value === selectedValue && value !== quiz.correctValue) {
      return [styles.option, styles.optionIncorrect];
    }

    return [styles.option, styles.optionDimmed];
  };

  const getOptionTextStyle = (value: string) => {
    if (!locked) return styles.optionText;

    if (value === quiz.correctValue) {
      return [styles.optionText, styles.optionTextCorrect];
    }

    if (value === selectedValue && value !== quiz.correctValue) {
      return [styles.optionText, styles.optionTextIncorrect];
    }

    return [styles.optionText, styles.optionTextDimmed];
  };

  const renderIcon = (value: string) => {
    if (!locked) return null;

    if (value === quiz.correctValue) {
      return (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      );
    }

    if (value === selectedValue && value !== quiz.correctValue) {
      return <Ionicons name="close-circle" size={20} color={COLORS.danger} />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>理解度チェック</Text>

      <Text style={styles.question}>{quiz.question}</Text>

      <View style={styles.options}>
        {quiz.options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={getOptionStyle(option.value)}
            onPress={() => handleSelect(option.value)}
            activeOpacity={locked ? 1 : 0.7}
          >
            <Text style={getOptionTextStyle(option.value)}>
              {option.label}
            </Text>
            {renderIcon(option.value)}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation card */}
      <Animated.View style={{ opacity: explanationOpacity }}>
        <Card
          variant="outlined"
          style={{
            ...styles.explanationCard,
            borderColor: isCorrect ? COLORS.success : COLORS.warning,
          }}
        >
          <View style={styles.explanationRow}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={isCorrect ? COLORS.success : COLORS.warning}
            />
            <Text style={styles.explanationText}>{quiz.explanation}</Text>
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  options: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  option: {
    minHeight: 52,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCorrect: {
    borderWidth: 2,
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  optionIncorrect: {
    borderWidth: 2,
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}10`,
  },
  optionDimmed: {
    opacity: 0.4,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  optionTextCorrect: {
    color: COLORS.success,
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: COLORS.danger,
  },
  optionTextDimmed: {
    color: COLORS.textSecondary,
  },
  explanationCard: {
    borderColor: COLORS.success,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  explanationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});
