import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import type { LocalePreference } from '@/types/i18n';

interface LocalePickerModalProps {
  visible: boolean;
  currentPreference: LocalePreference;
  onSelect: (pref: LocalePreference) => void;
  onClose: () => void;
}

const OPTION_CONFIGS: { value: LocalePreference; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', labelKey: 'localePicker.system', icon: 'phone-portrait-outline' },
  { value: 'ja', labelKey: 'localePicker.ja', icon: 'language-outline' },
  { value: 'en', labelKey: 'localePicker.en', icon: 'globe-outline' },
];

export function LocalePickerModal({ visible, currentPreference, onSelect, onClose }: LocalePickerModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('localePicker.title')}</Text>
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
