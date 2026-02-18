import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.containerLast]}
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
              color={destructive ? COLORS.error : COLORS.textSecondary}
            />
          </View>
        )}
        <Text style={[styles.label, destructive && styles.destructiveLabel]}>
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {type === 'value' && (
          <Text style={styles.valueText}>{value}</Text>
        )}

        {type === 'toggle' && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: COLORS.surfaceHighlight, true: COLORS.primary }}
            thumbColor={'#FFF'}
            ios_backgroundColor={COLORS.surfaceHighlight}
          />
        )}

        {onPress && (type === 'link' || type === 'value') && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.surfaceHighlight,
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
    color: COLORS.text,
  },
  destructiveLabel: {
    color: COLORS.error,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  valueText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});
