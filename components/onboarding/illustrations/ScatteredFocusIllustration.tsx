import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function ScatteredFocusIllustration() {
  const { colors } = useTheme();
  const items: Array<{
    icon: React.ComponentProps<typeof Ionicons>['name'];
    offset: { top?: number; left?: number; right?: number; bottom?: number };
    rotation: string;
  }> = [
    { icon: 'time-outline', offset: { top: 10, left: 20 }, rotation: '-15deg' },
    { icon: 'document-text-outline', offset: { top: 5, right: 25 }, rotation: '12deg' },
    { icon: 'code-slash-outline', offset: { bottom: 20, left: 50 }, rotation: '-8deg' },
  ];

  return (
    <View style={illStyles.scatteredContainer}>
      {items.map((item) => (
        <View
          key={item.icon}
          style={[
            illStyles.scatteredIcon,
            { backgroundColor: colors.surface },
            item.offset,
            { transform: [{ rotate: item.rotation }] },
          ]}
        >
          <Ionicons name={item.icon} size={28} color={colors.textSecondary} />
        </View>
      ))}
      <View style={illStyles.scatteredOverlay}>
        <Ionicons name="close-circle-outline" size={32} color={colors.danger} />
      </View>
      <View style={illStyles.scatteredBarContainer}>
        <ProgressBar progress={0.12} height={6} color={colors.textSecondary} />
      </View>
    </View>
  );
}
