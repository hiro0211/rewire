import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          {showFeedback ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>ご意見をお聞かせください</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                より良いアプリにするため、{'\n'}フィードバックをお寄せください
              </Text>
              <View style={styles.buttons}>
                <Button title="フィードバックを送る" onPress={onFeedbackTap} variant="gradient" style={styles.fullWidth} />
                <Button title="閉じる" onPress={onDismiss} variant="ghost" style={styles.fullWidth} />
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Rewireを気に入っていますか？</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                あなたの評価は今後の改善に{'\n'}役立ちます
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => onRate(star)}
                    accessibilityRole="button"
                    accessibilityLabel={`${star}つ星`}
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
              <Button title="あとで" onPress={onDismiss} variant="ghost" style={styles.fullWidth} />
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
