import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

interface SurveyPromptModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function SurveyPromptModal({ visible, onAccept, onDismiss }: SurveyPromptModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>アンケートのお願い</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            アプリの体験向上と機能改善のため、簡単なアンケートにご協力お願いします。
          </Text>
          <View style={styles.buttons}>
            <Button title="回答する" onPress={onAccept} variant="gradient" style={styles.acceptButton} />
            <Button title="あとで" onPress={onDismiss} variant="ghost" style={styles.dismissButton} />
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
