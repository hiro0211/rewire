import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import type { AssessmentQuestion } from '@/constants/assessment';

interface AssessmentYesNoStepProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

const YES_NO_OPTIONS = [
  { label: 'はい', value: 'yes' },
  { label: 'いいえ', value: 'no' },
];

export function AssessmentYesNoStep({
  question,
  questionIndex,
  totalQuestions,
  selectedValue,
  onSelect,
}: AssessmentYesNoStepProps) {
  return (
    <View style={styles.container}>
      <Text testID="question-heading" style={styles.counter}>
        Question #{questionIndex + 1}
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {YES_NO_OPTIONS.map((option, index) => {
          const selected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              testID={`option-pill-${index}`}
              style={[
                styles.option,
                selected && styles.optionSelected,
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.badge, selected && styles.badgeSelected]}
                testID={selected ? `badge-checkmark-${index}` : undefined}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text style={styles.badgeText}>{index + 1}</Text>
                )}
              </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'left',
    marginBottom: 40,
  },
  options: {
    width: '100%',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: COLORS.pillBackground,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.pillBorder,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionSelected: {
    borderColor: COLORS.selectedPillBorder,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.selectedPillBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSelected: {
    backgroundColor: COLORS.success,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.selectedPillBorder,
  },
});
