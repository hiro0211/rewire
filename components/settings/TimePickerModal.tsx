import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface TimePickerModalProps {
  visible: boolean;
  currentTime: string; // "HH:mm"
  onClose: () => void;
  onSave: (time: string) => void;
}

export const TimePickerModal = ({
  visible,
  currentTime,
  onClose,
  onSave,
}: TimePickerModalProps) => {
  const { colors } = useTheme();

  // Generate time slots every 30 mins
  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>通知時間を選択</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.item,
                  { borderBottomColor: colors.surfaceHighlight },
                  time === currentTime && { backgroundColor: colors.surfaceHighlight, borderRadius: RADIUS.sm },
                ]}
                onPress={() => {
                  onSave(time);
                  onClose();
                }}
              >
                <Text style={[
                  styles.itemText,
                  { color: colors.text },
                  time === currentTime && { color: colors.primary, fontWeight: 'bold' },
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  list: {
    marginBottom: SPACING.md,
  },
  item: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemText: {
    fontSize: FONT_SIZE.md,
  },
  closeButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  closeText: {
    fontSize: FONT_SIZE.md,
  },
});
