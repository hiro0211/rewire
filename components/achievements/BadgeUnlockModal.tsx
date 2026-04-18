import { BadgeOrb } from '@/components/achievements/BadgeOrb';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface BadgeUnlockModalProps {
  badge: NeuralBadgeDefinition | null;
  onDismiss: () => void;
}

/**
 * バッジアンロック時に表示する祝福モーダル。
 * バッジ名・説明文・BadgeOrb を中央に表示し、「素晴らしい！」ボタンで閉じる。
 */
export function BadgeUnlockModal({ badge, onDismiss }: BadgeUnlockModalProps) {
  const { colors } = useTheme();

  if (!badge) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.background ?? '#0A0A0F' }]}>
          <BadgeOrb
            colors={badge.colors}
            size={100}
            isUnlocked
            chapterId={badge.chapter}
            badgeId={badge.id}
          />

          <Text style={[styles.title, { color: colors.text }]}>{badge.nameJa}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{badge.message}</Text>

          <Pressable
            testID="badge-unlock-dismiss"
            style={[styles.button, { borderColor: badge.colors.glow }]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: badge.colors.glow }]}>
              素晴らしい！
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
