import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface ReviewPromptModalProps {
  visible: boolean;
  selectedRating: number;
  showFeedback: boolean;
  onRate: (stars: number) => void;
  onFeedbackTap: () => void;
  onDismiss: () => void;
}

export function ReviewPromptModal({
  visible,
  selectedRating,
  showFeedback,
  onRate,
  onFeedbackTap,
  onDismiss,
}: ReviewPromptModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          {showFeedback ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{t('review.feedbackTitle')}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                {t('review.feedbackBody')}
              </Text>
              <View style={styles.buttons}>
                <Button title={t('review.sendFeedback')} onPress={onFeedbackTap} variant="gradient" style={styles.fullWidth} />
                <Button title={t('common.close')} onPress={onDismiss} variant="ghost" style={styles.fullWidth} />
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>{t('review.enjoyTitle')}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                {t('review.enjoyBody')}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => onRate(star)}
                    accessibilityRole="button"
                    accessibilityLabel={t('review.starLabel', { count: star })}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= selectedRating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= selectedRating ? colors.warning : colors.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>
              <Button title={t('common.later')} onPress={onDismiss} variant="ghost" style={styles.fullWidth} />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  content: {
    width: '100%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  starButton: {
    padding: SPACING.xs,
  },
  buttons: {
    gap: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
