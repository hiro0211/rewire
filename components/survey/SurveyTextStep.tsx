import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { SurveyQuestion } from '@/types/survey';

interface SurveyTextStepProps {
  question: SurveyQuestion;
  value: string;
  onChangeText: (text: string) => void;
}

export function SurveyTextStep({
  question,
  value,
  onChangeText,
}: SurveyTextStepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.text }]}>
        {question.question}
      </Text>

      {!question.required && (
        <Text style={[styles.optional, { color: colors.textSecondary }]}>
          任意
        </Text>
      )}

      <TextInput
        testID="survey-text-input"
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.pillBackground,
            borderColor: colors.pillBorder,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder="ここに入力してください"
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  question: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: SPACING.sm,
  },
  optional: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.md,
    minHeight: 120,
  },
});
