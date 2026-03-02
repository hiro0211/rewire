import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface SettingItemProps {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: 'link' | 'toggle' | 'value';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}

export const SettingItem = ({
  label,
  value,
  icon,
  type = 'link',
  toggleValue,
  onToggle,
  onPress,
  destructive = false,
  isLast = false,
}: SettingItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.surfaceHighlight },
        isLast && styles.containerLast,
      ]}
      onPress={type === 'toggle' ? () => onToggle?.(!toggleValue) : onPress}
      disabled={type === 'toggle' || !onPress}
      activeOpacity={type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={destructive ? colors.error : colors.textSecondary}
            />
          </View>
        )}
        <Text style={[styles.label, { color: colors.text }, destructive && { color: colors.error }]}>
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {type === 'value' && (
          <Text style={[styles.valueText, { color: colors.textSecondary }]}>{value}</Text>
        )}

        {type === 'toggle' && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.surfaceHighlight}
          />
        )}

        {onPress && (type === 'link' || type === 'value') && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.md,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  valueText: {
    fontSize: FONT_SIZE.md,
  },
});
