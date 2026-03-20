import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { GOAL_OPTIONS } from '@/constants/goals';
import { Button } from '@/components/ui/Button';

interface ProfileEditModalProps {
  visible: boolean;
  initialNickname: string;
  initialGoalDays: number;
  onClose: () => void;
  onSave: (nickname: string, goalDays: number) => void;
}

export const ProfileEditModal = ({
  visible,
  initialNickname,
  initialGoalDays,
  onClose,
  onSave,
}: ProfileEditModalProps) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [goalDays, setGoalDays] = useState(initialGoalDays);
  const { colors } = useTheme();
  const { t } = useLocale();

  useEffect(() => {
    if (visible) {
      setNickname(initialNickname);
      setGoalDays(initialGoalDays);
    }
  }, [visible, initialNickname, initialGoalDays]);

  const handleSave = () => {
    if (goalDays > 0) {
      onSave(nickname, goalDays);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.profileEdit.title')}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.labels.nickname')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.surfaceHighlight }]}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('settings.profileEdit.nicknamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.labels.goalDays')}</Text>
            <View style={[styles.pickerWrapper, { backgroundColor: colors.background, borderColor: colors.surfaceHighlight }]}>
              <Picker
                selectedValue={goalDays}
                onValueChange={(value) => setGoalDays(value)}
                itemStyle={[styles.pickerItem, { color: colors.text }]}
              >
                {GOAL_OPTIONS.map((days) => (
                  <Picker.Item key={days} label={t('settings.labels.daysFormat', { days })} value={days} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Button title={t('common.save')} onPress={handleSave} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
  },
  pickerWrapper: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pickerItem: {
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    padding: SPACING.md,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
  },
});
