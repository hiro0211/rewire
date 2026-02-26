import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, startOfDay } from 'date-fns';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface StreakEditModalProps {
  visible: boolean;
  initialDate: string;
  onClose: () => void;
  onSave: (date: string) => void;
}

export const StreakEditModal = ({
  visible,
  initialDate,
  onClose,
  onSave,
}: StreakEditModalProps) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const parsed = parseISO(initialDate);
      if (isNaN(parsed.getTime())) return startOfDay(new Date());
      const today = startOfDay(new Date());
      return parsed > today ? today : parsed;
    } catch {
      return startOfDay(new Date());
    }
  });

  useEffect(() => {
    if (visible) {
      try {
        const parsed = parseISO(initialDate);
        if (isNaN(parsed.getTime())) return;
        const today = startOfDay(new Date());
        setSelectedDate(parsed > today ? today : parsed);
      } catch {
        // Invalid date — keep current selection
      }
    }
  }, [visible, initialDate]);

  const handleSave = () => {
    onSave(format(selectedDate, 'yyyy-MM-dd'));
    onClose();
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
          <Text style={styles.title}>開始日を編集</Text>
          <Text style={styles.description}>
            アプリ導入前から継続している場合、開始日を変更できます
          </Text>

          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (date) setSelectedDate(date);
              }}
              locale="ja"
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
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  pickerWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceHighlight,
    marginBottom: SPACING.lg,
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
