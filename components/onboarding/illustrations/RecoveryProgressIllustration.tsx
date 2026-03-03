import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function RecoveryProgressIllustration() {
  const { colors } = useTheme();
  const steps: Array<{
    icon: React.ComponentProps<typeof Ionicons>['name'];
    size: number;
    color: string;
  }> = [
    { icon: 'cloudy-outline', size: 24, color: colors.textSecondary },
    { icon: 'cloudy-outline', size: 28, color: '#5A5A6A' },
    { icon: 'partly-sunny-outline', size: 32, color: colors.warning },
    { icon: 'partly-sunny-outline', size: 36, color: '#7BC47F' },
    { icon: 'sunny-outline', size: 40, color: colors.success },
  ];

  return (
    <View style={illStyles.recoveryContainer}>
      <View style={illStyles.recoveryRow}>
        {steps.map((s, i) => (
          <View
            key={i}
            style={[
              illStyles.recoveryCircle,
              {
                width: 44 + i * 4,
                height: 44 + i * 4,
                borderRadius: (44 + i * 4) / 2,
                backgroundColor:
                  i < 2
                    ? colors.surface
                    : i === 2
                      ? colors.surfaceHighlight
                      : `${colors.success}20`,
              },
            ]}
          >
            <Ionicons name={s.icon} size={s.size} color={s.color} />
          </View>
        ))}
      </View>
      <View style={illStyles.arrowLine}>
        <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
      </View>
    </View>
  );
}
