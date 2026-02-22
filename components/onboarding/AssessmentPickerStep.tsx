import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text } from '@/components/Themed';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
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

  const handleValueChange = (value: string) => {
    setLocalValue(value);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Q {questionIndex + 1}/{totalQuestions}
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={localValue}
          onValueChange={handleValueChange}
          itemStyle={styles.pickerItem}
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
    marginBottom: SPACING.xxl,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    color: COLORS.text,
    fontSize: 22,
  },
});
