import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { SurveyQuestion } from '@/types/survey';

interface SurveyChoiceStepProps {
  question: SurveyQuestion;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  otherTextValue?: string;
  onOtherTextChange?: (text: string) => void;
}

export function SurveyChoiceStep({
  question,
  selectedValue,
  onSelect,
  otherTextValue,
  onOtherTextChange,
}: SurveyChoiceStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const showOtherInput =
    question.otherTextId && selectedValue === 'other';

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.text }]}>
        {t(question.questionKey)}
      </Text>

      <View style={styles.options}>
        {question.options?.map((option, index) => {
          const selected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              testID={`option-pill-${index}`}
              style={[
                styles.option,
                {
                  backgroundColor: colors.pillBackground,
                  borderColor: colors.pillBorder,
                },
                selected && {
                  borderColor: colors.selectedPillBorder,
                  backgroundColor: 'rgba(0, 180, 216, 0.1)',
                },
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.selectedPillBorder },
                  selected && { backgroundColor: colors.success },
                ]}
                testID={selected ? `badge-checkmark-${index}` : undefined}
              >
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.contrastText}
                  />
                ) : (
                  <Text style={[styles.badgeText, { color: colors.contrastText }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  selected && { color: colors.selectedPillBorder },
                ]}
              >
                {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showOtherInput && (
        <TextInput
          testID="other-text-input"
          style={[
            styles.otherInput,
            {
              color: colors.text,
              backgroundColor: colors.pillBackground,
              borderColor: colors.pillBorder,
            },
          ]}
          value={otherTextValue ?? ''}
          onChangeText={onOtherTextChange}
          placeholder={t('surveyForm.otherPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
      )}
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
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  otherInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.md,
    minHeight: 80,
    marginTop: 16,
  },
});
