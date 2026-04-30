import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  RADIUS,
  SPACING,
} from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'warning' | 'info';

interface SafariExtensionAlertCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
  variant?: Variant;
}

export function SafariExtensionAlertCard({
  title,
  description,
  actionLabel,
  onPress,
  variant = 'warning',
}: SafariExtensionAlertCardProps) {
  const { colors, shadows } = useTheme();
  const accentColor = variant === 'info' ? colors.primary : colors.danger;
  const iconName = variant === 'info' ? 'refresh-circle-outline' : 'shield-outline';

  return (
    <View
      testID="safari-extension-alert-card"
      style={[
        styles.card,
        shadows.glowCard,
        {
          backgroundColor: colors.surface,
          borderColor: accentColor,
          shadowColor: accentColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${accentColor}22` },
          ]}
        >
          <Ionicons
            testID="safari-extension-alert-icon"
            name={iconName}
            size={24}
            color={accentColor}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {description}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID="safari-extension-alert-button"
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.button, { backgroundColor: accentColor }]}
      >
        <Ionicons name="arrow-forward-circle" size={18} color="#FFFFFF" />
        <Text style={styles.buttonLabel}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.md,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.body,
    marginTop: SPACING.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
