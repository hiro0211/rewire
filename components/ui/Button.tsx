import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RADIUS, SPACING, FONT_SIZE, LAYOUT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, gradients, glow } = useTheme();
  const height = size === 'lg' ? 58 : LAYOUT.buttonHeight;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceHighlight;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surfaceHighlight;
      case 'danger': return colors.danger;
      case 'ghost': return 'transparent';
      case 'gradient': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary': return colors.contrastText;
      case 'ghost': return colors.primary;
      case 'gradient': return colors.contrastText;
      default: return colors.text;
    }
  };

  if (variant === 'gradient' && !disabled) {
    return (
      <TouchableOpacity
        style={[styles.gradientOuter, { height, shadowColor: glow.purple }, style]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={[...gradients.button]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientInner, { height }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.contrastText} />
          ) : (
            <Text style={[styles.text, { color: colors.contrastText }, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          height,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  gradientOuter: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientInner: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
