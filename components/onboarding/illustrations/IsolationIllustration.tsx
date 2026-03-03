import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function IsolationIllustration() {
  const { colors } = useTheme();
  return (
    <View style={illStyles.isolationContainer}>
      <View style={[illStyles.isolationCenter, { backgroundColor: colors.surface }]}>
        <Ionicons name="person-outline" size={36} color={colors.textSecondary} />
      </View>
      <View style={[illStyles.isolationDistant, { top: 0, left: '50%', marginLeft: -16 }]}>
        <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { bottom: 0, left: '50%', marginLeft: -16 }]}>
        <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { top: '50%', left: 0, marginTop: -16 }]}>
        <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { top: '50%', right: 0, marginTop: -16 }]}>
        <Ionicons name="people-outline" size={20} color={colors.textSecondary} style={{ opacity: 0.25 }} />
      </View>
    </View>
  );
}
