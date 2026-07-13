import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';

interface WhatsNewModalProps {
  visible: boolean;
  onTryNow: () => void;
  onDismiss: () => void;
}

/**
 * アップデートによる機能刷新を既存ユーザーに一度だけ知らせるモーダル。
 * （Safari 拡張 → アプリ内ワンタップのブロック方式変更の告知）
 */
export function WhatsNewModal({ visible, onTryNow, onDismiss }: WhatsNewModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onDismiss}
      >
        <Pressable style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t('appUpdate.whatsNew.title')}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {t('appUpdate.whatsNew.body')}
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('appUpdate.whatsNew.hint')}
          </Text>

          <View style={styles.buttons}>
            <Button
              title={t('appUpdate.whatsNew.tryNow')}
              onPress={onTryNow}
              variant="gradient"
              style={styles.fullWidth}
            />
            <Button
              title={t('appUpdate.whatsNew.later')}
              onPress={onDismiss}
              variant="ghost"
              style={styles.fullWidth}
            />
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
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  body: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  buttons: {
    alignSelf: 'stretch',
    gap: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
