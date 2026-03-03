import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function VibrantLifeIllustration() {
  const { colors } = useTheme();
  const icons: Array<React.ComponentProps<typeof Ionicons>['name']> = [
    'restaurant-outline',
    'people-outline',
    'briefcase-outline',
    'game-controller-outline',
    'musical-notes-outline',
  ];

  return (
    <View style={illStyles.dimmedContainer}>
      <View style={illStyles.iconsRow}>
        {icons.map((icon) => (
          <View key={icon} style={[illStyles.vibrantIconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name={icon} size={24} color={colors.primary} />
          </View>
        ))}
      </View>
      <View style={illStyles.joyMeterContainer}>
        <Text style={[illStyles.joyLabelVibrant, { color: colors.success }]}>Joy</Text>
        <View style={illStyles.joyBarWrapper}>
          <ProgressBar progress={0.88} height={8} color={colors.success} />
        </View>
      </View>
    </View>
  );
}
