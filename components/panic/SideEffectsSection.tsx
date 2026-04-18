import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT, } from '@/constants/theme';
import { SIDE_EFFECTS } from '@/constants/panic';
import { useLocale } from '@/hooks/useLocale';

/**
 * Displays the "What happens if you watch?" heading and the six side effect
 * cards below the camera preview. Each card uses an Ionicon with a tinted
 * circular background plus a title and supporting description to remind the
 * user of the downsides of relapsing in this moment.
 */
export function SideEffectsSection() {
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('panic.sideEffectsTitle')}</Text>
      <View style={styles.cards}>
        {SIDE_EFFECTS.map((effect) => (
          <View key={effect.id} style={styles.card}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${effect.iconColor}22` },
              ]}
            >
              <Ionicons name={effect.icon} size={22} color={effect.iconColor} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.cardTitle}>{t(effect.titleKey)}</Text>
              <Text style={styles.cardDescription}>
                {t(effect.descriptionKey)}
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
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  cards: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
});
