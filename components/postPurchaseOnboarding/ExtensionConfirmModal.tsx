import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  RADIUS,
  SPACING,
} from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

export interface ExtensionConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function ExtensionConfirmModal({
  visible,
  onConfirm,
  onOpenSettings,
  onClose,
}: ExtensionConfirmModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="extension-confirm-overlay"
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <Ionicons name="sparkles" size={36} color={colors.primary} style={styles.icon} />
          <Text style={[styles.title, { color: colors.text }]}>
            {t('postPurchaseOnboarding.demo.confirm.title')}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('postPurchaseOnboarding.demo.confirm.body')}
          </Text>
          <View style={styles.buttons}>
            <Button
              title={t('postPurchaseOnboarding.demo.confirm.confirmButton')}
              onPress={onConfirm}
              variant="gradient"
              style={styles.fullWidth}
            />
            <Pressable onPress={onOpenSettings} style={styles.secondaryButton}>
              <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>
                {t('postPurchaseOnboarding.demo.confirm.openSettingsButton')}
              </Text>
            </Pressable>
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
    alignItems: 'center',
  },
  icon: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.md,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  secondaryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
});
