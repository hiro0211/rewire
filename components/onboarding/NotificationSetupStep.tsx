import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';

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
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="notifications-outline" size={48} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.notification.title')}</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('onboarding.notification.description')}
      </Text>

      <Text style={[styles.pickerLabel, { color: colors.text }]}>{t('onboarding.notification.pickerLabel')}</Text>

      <View style={[styles.pickerContainer, { backgroundColor: colors.pillBackground }]}>
        <Picker
          selectedValue={selectedTime}
          onValueChange={(value) => onTimeChange(value)}
          itemStyle={[styles.pickerItem, { color: colors.text }]}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  pickerLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  pickerItem: {
    fontSize: 22,
  },
});
