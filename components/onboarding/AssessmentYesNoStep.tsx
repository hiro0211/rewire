import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import type { AssessmentQuestion } from '@/constants/assessment';

interface AssessmentYesNoStepProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export function AssessmentYesNoStep({
  question,
  questionIndex,
  totalQuestions,
  selectedValue,
  onSelect,
}: AssessmentYesNoStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Q {questionIndex + 1}/{totalQuestions}
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedValue === 'yes' && styles.buttonSelected,
          ]}
          onPress={() => onSelect('yes')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              selectedValue === 'yes' && styles.buttonTextSelected,
            ]}
          >
            はい
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            selectedValue === 'no' && styles.buttonSelected,
          ]}
          onPress={() => onSelect('no')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              selectedValue === 'no' && styles.buttonTextSelected,
            ]}
          >
            いいえ
          </Text>
        </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  buttonTextSelected: {
    color: COLORS.primary,
  },
});
