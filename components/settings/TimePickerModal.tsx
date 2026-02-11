import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>通知時間を選択</Text>
          
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.item,
                  time === currentTime && styles.selectedItem
                ]}
                onPress={() => {
                  onSave(time);
                  onClose();
                }}
              >
                <Text style={[
                  styles.itemText,
                  time === currentTime && styles.selectedItemText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  list: {
    marginBottom: SPACING.md,
  },
  item: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceHighlight,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.sm,
  },
  itemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
