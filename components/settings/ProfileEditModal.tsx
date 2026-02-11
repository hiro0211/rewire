import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
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
  const [goalDays, setGoalDays] = useState(initialGoalDays.toString());

  useEffect(() => {
    if (visible) {
      setNickname(initialNickname);
      setGoalDays(initialGoalDays.toString());
    }
  }, [visible, initialNickname, initialGoalDays]);

  const handleSave = () => {
    const days = parseInt(goalDays, 10);
    if (days > 0) {
      onSave(nickname, days);
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
            <Text style={styles.label}>目標日数（日）</Text>
            <TextInput
              style={styles.input}
              value={goalDays}
              onChangeText={setGoalDays}
              keyboardType="number-pad"
              placeholder="目標日数を入力"
              placeholderTextColor={COLORS.textSecondary}
            />
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
