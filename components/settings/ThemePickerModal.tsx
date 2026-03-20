import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { ThemePreference } from '@/types/theme';

interface ThemePickerModalProps {
  visible: boolean;
  currentPreference: ThemePreference;
  onSelect: (pref: ThemePreference) => void;
  onClose: () => void;
}

const OPTION_CONFIGS: { value: ThemePreference; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', labelKey: 'settings.theme.system', icon: 'phone-portrait-outline' },
  { value: 'light', labelKey: 'settings.theme.light', icon: 'sunny-outline' },
  { value: 'dark', labelKey: 'settings.theme.dark', icon: 'moon-outline' },
];

export function ThemePickerModal({ visible, currentPreference, onSelect, onClose }: ThemePickerModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('themePicker.title')}</Text>
          {OPTION_CONFIGS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(option.value)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon} size={22} color={colors.textSecondary} />
                <Text style={[styles.optionLabel, { color: colors.text }]}>{t(option.labelKey)}</Text>
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
