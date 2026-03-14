import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { SYMPTOM_CATEGORIES } from '@/constants/symptoms';

interface SymptomSelectStepProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptomId: string) => void;
}

export function SymptomSelectStep({
  selectedSymptoms,
  onToggleSymptom,
}: SymptomSelectStepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text testID="symptom-title" style={[styles.title, { color: colors.text }]}>
        症状
      </Text>

      <View
        testID="info-bubble"
        style={[styles.infoBubble, {
          backgroundColor: 'rgba(240, 160, 48, 0.1)',
          borderColor: 'rgba(240, 160, 48, 0.3)',
        }]}
      >
        <Ionicons name="information-circle" size={20} color={colors.warning} />
        <Text style={[styles.infoText, { color: colors.warning }]}>
          過度なポルノ視聴は、心身にさまざまな影響を及ぼすことがわかっています
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        当てはまる症状を選んでください
      </Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SYMPTOM_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <Text
              testID={`category-title-${category.id}`}
              style={[styles.categoryTitle, { color: colors.textSecondary }]}
            >
              {category.title}
            </Text>
            <View style={styles.itemsContainer}>
              {category.items.map((item) => {
                const selected = selectedSymptoms.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    testID={`symptom-item-${item.id}`}
                    style={[
                      styles.symptomItem,
                      {
                        backgroundColor: colors.pillBackground,
                        borderColor: colors.pillBorder,
                      },
                      selected && {
                        borderColor: colors.selectedPillBorder,
                        backgroundColor: 'rgba(0, 180, 216, 0.1)',
                      },
                    ]}
                    onPress={() => onToggleSymptom(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      testID={selected ? `symptom-check-${item.id}` : `symptom-circle-${item.id}`}
                      style={[
                        styles.checkbox,
                        { borderColor: colors.pillBorder },
                        selected && {
                          backgroundColor: colors.success,
                          borderColor: colors.success,
                        },
                      ]}
                    >
                      {selected && (
                        <Ionicons name="checkmark" size={14} color={colors.contrastText} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.symptomText,
                        { color: colors.text },
                        selected && { color: colors.selectedPillBorder },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  infoBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  categoryContainer: {
    marginBottom: SPACING.xl,
  },
  categoryTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  itemsContainer: {
    gap: SPACING.sm,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomText: {
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
});
