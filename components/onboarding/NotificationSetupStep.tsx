import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
        {
          '連続して記録を続けることで、あなたの変化が\n数字で見えてきます。毎日のチェックインが\n自己成長の第一歩です。'
        }
      </Text>

      <Text style={styles.pickerLabel}>何時に振り返りますか？</Text>

      <ScrollView
        style={styles.timeList}
        showsVerticalScrollIndicator={false}
      >
        {TIME_SLOTS.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeItem,
              time === selectedTime && styles.timeItemSelected,
            ]}
            onPress={() => onTimeChange(time)}
          >
            <Text
              style={[
                styles.timeText,
                time === selectedTime && styles.timeTextSelected,
              ]}
            >
              {time}
            </Text>
            {time === selectedTime && (
              <Ionicons name="checkmark" size={18} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  timeList: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceHighlight,
  },
  timeItemSelected: {
    backgroundColor: COLORS.surfaceHighlight,
  },
  timeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  timeTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
