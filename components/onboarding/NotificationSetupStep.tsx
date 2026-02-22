import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

interface NotificationSetupStepProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

const TIME_SLOTS: string[] = [];
for (let i = 0; i < 24; i++) {
  const hour = i.toString().padStart(2, '0');
  TIME_SLOTS.push(`${hour}:00`);
  TIME_SLOTS.push(`${hour}:30`);
}

export const NotificationSetupStep = ({
  selectedTime,
  onTimeChange,
}: NotificationSetupStepProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>{'毎日の振り返りが\n成長の鍵です'}</Text>

      <Text style={styles.description}>
        {'記録を続けることで、あなたの変化が\n数字として見えてきます。'}
      </Text>

      <Text style={styles.pickerLabel}>何時に振り返りますか？</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTime}
          onValueChange={(value) => onTimeChange(value)}
          itemStyle={styles.pickerItem}
        >
          {TIME_SLOTS.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  pickerLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    color: COLORS.text,
    fontSize: 22,
  },
});
