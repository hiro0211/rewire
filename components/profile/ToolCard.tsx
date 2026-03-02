import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ToolCardProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function ToolCard({ icon, iconColor, title, description, onPress }: ToolCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
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
    fontWeight: '700',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
});
