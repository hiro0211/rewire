import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import type { AssessmentQuestion } from '@/constants/assessment';

interface AssessmentChoiceStepProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export function AssessmentChoiceStep({
  question,
  questionIndex,
  totalQuestions,
  selectedValue,
  onSelect,
}: AssessmentChoiceStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Q {questionIndex + 1}/{totalQuestions}
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {question.options?.map((option) => {
          const selected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selected && styles.optionSelected,
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  counter: {
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
  },
  option: {
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
  },
});
