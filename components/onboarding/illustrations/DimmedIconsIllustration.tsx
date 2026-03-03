import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function DimmedIconsIllustration() {
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
          <View key={icon} style={[illStyles.dimmedIconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name={icon} size={24} color={colors.textSecondary} />
          </View>
        ))}
      </View>
      <View style={illStyles.joyMeterContainer}>
        <Text style={[illStyles.joyLabel, { color: colors.textSecondary }]}>Joy</Text>
        <View style={illStyles.joyBarWrapper}>
          <ProgressBar progress={0.12} height={8} color={colors.textSecondary} />
        </View>
      </View>
    </View>
  );
}
