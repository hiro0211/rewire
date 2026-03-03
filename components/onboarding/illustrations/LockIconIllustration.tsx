import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function LockIconIllustration() {
  const { colors } = useTheme();
  return (
    <View style={illStyles.lockContainer}>
      <View style={[illStyles.dot, illStyles.dotTopLeft, { backgroundColor: colors.warning }]} />
      <View style={[illStyles.dot, illStyles.dotTopRight, { backgroundColor: colors.warning }]} />
      <View style={[illStyles.dot, illStyles.dotBottomLeft, { backgroundColor: colors.warning }]} />
      <View style={[illStyles.dot, illStyles.dotBottomRight, { backgroundColor: colors.warning }]} />
      <View style={[illStyles.lockCircle, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="lock-open-outline" size={48} color={colors.warning} />
      </View>
    </View>
  );
}
