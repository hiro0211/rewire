import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function ShameCycleIllustration() {
  const { colors } = useTheme();
  const steps: Array<{
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }> = [
    { label: '視聴', icon: 'eye-outline' },
    { label: '後悔', icon: 'sad-outline' },
    { label: 'ストレス', icon: 'alert-circle-outline' },
    { label: '渇望', icon: 'flame-outline' },
  ];

  return (
    <View style={illStyles.cycleContainer}>
      <View style={[illStyles.cycleNode, illStyles.cycleTop]}>
        <Ionicons name={steps[0].icon} size={20} color={colors.warning} />
        <Text style={[illStyles.cycleLabel, { color: colors.warning }]}>{steps[0].label}</Text>
      </View>
      <View style={[illStyles.cycleNode, illStyles.cycleRight]}>
        <Ionicons name={steps[1].icon} size={20} color={colors.warning} />
        <Text style={[illStyles.cycleLabel, { color: colors.warning }]}>{steps[1].label}</Text>
      </View>
      <View style={[illStyles.cycleNode, illStyles.cycleBottom]}>
        <Ionicons name={steps[2].icon} size={20} color={colors.warning} />
        <Text style={[illStyles.cycleLabel, { color: colors.warning }]}>{steps[2].label}</Text>
      </View>
      <View style={[illStyles.cycleNode, illStyles.cycleLeft]}>
        <Ionicons name={steps[3].icon} size={20} color={colors.warning} />
        <Text style={[illStyles.cycleLabel, { color: colors.warning }]}>{steps[3].label}</Text>
      </View>
      <View style={[illStyles.cycleArrow, { top: 20, right: 30 }]}>
        <Ionicons name="arrow-forward" size={14} color={colors.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { bottom: 30, right: 20 }]}>
        <Ionicons name="arrow-down" size={14} color={colors.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { bottom: 20, left: 30 }]}>
        <Ionicons name="arrow-back" size={14} color={colors.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { top: 30, left: 20 }]}>
        <Ionicons name="arrow-up" size={14} color={colors.warning} style={{ opacity: 0.5 }} />
      </View>
    </View>
  );
}
