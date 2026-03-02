import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/types/theme';

interface ThemePickerModalProps {
  visible: boolean;
  currentPreference: ThemePreference;
  onSelect: (pref: ThemePreference) => void;
  onClose: () => void;
}

const OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'システム設定に合わせる', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'ライトモード', icon: 'sunny-outline' },
  { value: 'dark', label: 'ダークモード', icon: 'moon-outline' },
];

export function ThemePickerModal({ visible, currentPreference, onSelect, onClose }: ThemePickerModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>外観</Text>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(option.value)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon} size={22} color={colors.textSecondary} />
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
              </View>
              {currentPreference === option.value && (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  content: {
    width: '100%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
  },
});
