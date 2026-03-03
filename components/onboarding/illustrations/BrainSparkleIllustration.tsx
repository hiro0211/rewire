import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { illStyles } from './illustrationStyles';

export function BrainSparkleIllustration() {
  const { colors } = useTheme();
  return (
    <View style={illStyles.brainContainer}>
      <View style={[illStyles.brainCircle, { backgroundColor: `${colors.success}20` }]}>
        <Ionicons name="flash-outline" size={48} color={colors.success} />
      </View>
      <View style={[illStyles.sparkle, { top: 5, right: 10 }]}>
        <Ionicons name="sparkles-outline" size={20} color={colors.success} style={{ opacity: 0.6 }} />
      </View>
      <View style={[illStyles.sparkle, { top: 10, left: 5 }]}>
        <Ionicons name="sparkles-outline" size={16} color={colors.success} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.sparkle, { bottom: 10, right: 5 }]}>
        <Ionicons name="sparkles-outline" size={18} color={colors.success} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.sparkle, { bottom: 5, left: 10 }]}>
        <Ionicons name="sparkles-outline" size={20} color={colors.success} style={{ opacity: 0.6 }} />
      </View>
    </View>
  );
}
