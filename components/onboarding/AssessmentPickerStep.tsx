import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { AssessmentQuestion } from '@/constants/assessment';

interface AssessmentPickerStepProps {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

export function AssessmentPickerStep({
  question,
  questionIndex,
  totalQuestions,
  selectedValue,
  onSelect,
}: AssessmentPickerStepProps) {
  const range = question.pickerRange!;
  const defaultValue = String(Math.min(25, range.max));
  const [localValue, setLocalValue] = useState(selectedValue || defaultValue);
  const { colors } = useTheme();

  const handleValueChange = (value: string) => {
    setLocalValue(value);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Text testID="question-heading" style={[styles.counter, { color: colors.text }]}>
        Question #{questionIndex + 1}
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>{question.question}</Text>

      <View style={[styles.pickerContainer, { backgroundColor: colors.pillBackground }]}>
        <Picker
          selectedValue={localValue}
          onValueChange={handleValueChange}
          itemStyle={[styles.pickerItem, { color: colors.text }]}
        >
          {Array.from(
            { length: range.max - range.min + 1 },
            (_, i) => range.min + i,
          ).map((age) => (
            <Picker.Item
              key={age}
              label={`${age}${range.suffix}`}
              value={String(age)}
            />
          ))}
        </Picker>
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
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  pickerContainer: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    fontSize: 22,
  },
});
