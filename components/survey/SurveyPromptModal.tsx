import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface SurveyPromptModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function SurveyPromptModal({ visible, onAccept, onDismiss }: SurveyPromptModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('surveyPrompt.title')}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('surveyPrompt.body')}
          </Text>
          <View style={styles.buttons}>
            <Button title={t('surveyPrompt.accept')} onPress={onAccept} variant="gradient" style={styles.acceptButton} />
            <Button title={t('common.later')} onPress={onDismiss} variant="ghost" style={styles.dismissButton} />
          </View>
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
  buttons: {
    gap: SPACING.sm,
  },
  acceptButton: {
    width: '100%',
  },
  dismissButton: {
    width: '100%',
  },
});
