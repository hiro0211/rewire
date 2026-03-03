import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function DopamineBarsIllustration() {
  const { colors } = useTheme();
  const bars = [
    { label: '食事', height: 40, color: colors.success },
    { label: '運動', height: 35, color: colors.success },
    { label: 'ポルノ', height: 100, color: colors.warning },
    { label: '達成感', height: 45, color: colors.success },
    { label: '会話', height: 30, color: colors.success },
  ];

  return (
    <View style={illStyles.barsContainer}>
      <View style={illStyles.arrowContainer}>
        <Ionicons name="arrow-up" size={20} color={colors.warning} />
      </View>
      <View style={illStyles.barsRow}>
        {bars.map((bar) => (
          <View key={bar.label} style={illStyles.barColumn}>
            <View
              style={[
                illStyles.bar,
                {
                  height: bar.height,
                  backgroundColor: bar.color,
                },
              ]}
            />
            <Text style={[illStyles.barLabel, { color: colors.textSecondary }]}>{bar.label}</Text>
          </View>
        ))}
      </View>
      <View style={[illStyles.baseline, { backgroundColor: colors.border }]} />
    </View>
  );
}
