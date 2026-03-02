import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

export interface LevelOption {
  value: number;
  label: string;
}

interface LevelSelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: LevelOption[];
}

export function LevelSelector({
  label,
  value,
  onChange,
  options,
}: LevelSelectorProps) {
  const { colors } = useTheme();

  const handlePress = (optionValue: number) => {
    Haptics.selectionAsync();
    onChange(optionValue);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.buttons}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.button,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.surfaceHighlight,
                },
              ]}
              onPress={() => handlePress(option.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isActive ? colors.contrastText : colors.textSecondary,
                  },
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
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});
