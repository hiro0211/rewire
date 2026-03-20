import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO, startOfDay } from 'date-fns';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
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
  const { colors } = useTheme();
  const { t, locale } = useLocale();
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
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.streakEdit.title')}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('settings.streakEdit.description')}
          </Text>

          <View style={[styles.pickerWrapper, {
            backgroundColor: colors.background,
            borderColor: colors.surfaceHighlight,
          }]}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (date) setSelectedDate(date);
              }}
              locale={locale}
            />
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
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  pickerWrapper: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
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
    fontSize: FONT_SIZE.md,
  },
});
