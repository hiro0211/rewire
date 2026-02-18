import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
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
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>プロフィール編集</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ニックネーム</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="ニックネームを入力"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>目標日数</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={goalDays}
                onValueChange={(value) => setGoalDays(value)}
                itemStyle={styles.pickerItem}
              >
                {GOAL_OPTIONS.map((days) => (
                  <Picker.Item key={days} label={`${days}日`} value={days} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Button title="保存" onPress={handleSave} />
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
  },
  pickerWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
  },
  pickerItem: {
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
