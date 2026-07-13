import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, RADIUS, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';
import { APP_STORE_URL } from '@/constants/appUpdates';

interface ForceUpdateModalProps {
  visible: boolean;
}

/**
 * 強制アップデートモーダル。
 *
 * サポート終了バージョンの利用をブロックする。閉じる手段は提供せず、
 * App Store への導線だけを出す（onRequestClose も無視する）。
 */
export function ForceUpdateModal({ visible }: ForceUpdateModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  const handleOpenAppStore = useCallback(() => {
    void Linking.openURL(APP_STORE_URL);
  }, []);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
          <Ionicons name="cloud-download-outline" size={44} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {t('appUpdate.forceUpdate.title')}
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {t('appUpdate.forceUpdate.body')}
        </Text>

        <Button
          title={t('appUpdate.forceUpdate.openAppStore')}
          onPress={handleOpenAppStore}
          variant="gradient"
          style={styles.button}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  body: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  button: {
    alignSelf: 'stretch',
  },
});
