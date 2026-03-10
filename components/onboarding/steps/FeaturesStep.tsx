import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { FEATURES } from '@/constants/onboarding';

export function FeaturesStep() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Rewireでできること</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{''}</Text>
      <View style={styles.featuresContainer}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.surfaceHighlight }]}>
              <Ionicons name={feature.icon} size={28} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.featureTitleRow}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              </View>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
});
