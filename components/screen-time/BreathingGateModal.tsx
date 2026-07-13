import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/Button';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingText } from '@/components/breathing/BreathingText';
import { BreathingTimer } from '@/components/breathing/BreathingTimer';
import { useBreathingGate } from '@/hooks/screenTime/useBreathingGate';

interface BreathingGateModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * コンテンツブロッカーをオフにする前の「深呼吸ゲート」。
 *
 * SOS の呼吸画面（app/breathing）と同じ全画面デザインを再利用する。
 * 右上の×でいつでも中断できる（中断 = オフにしない）。3回の呼吸を
 * 終えたときだけ「本当にオフにしますか？」の確認を出す。
 */
export function BreathingGateModal({ visible, onConfirm, onCancel }: BreathingGateModalProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { phase, cycleCount, done } = useBreathingGate(visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="fullScreen"
    >
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        testID="breathing-gate-modal"
      >
        <StatusBar hidden />
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.background}
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          testID="breathing-gate-close"
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        {done ? (
          <View style={styles.confirmCenter}>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>
              {t('contentBlocker.breathingGate.confirmTitle')}
            </Text>
            <Text style={[styles.confirmBody, { color: colors.textSecondary }]}>
              {t('contentBlocker.breathingGate.confirmDescription')}
            </Text>
            <View style={styles.buttons}>
              <Button
                title={t('contentBlocker.breathingGate.keepProtection')}
                onPress={onCancel}
                variant="gradient"
                style={styles.fullWidth}
              />
              <Button
                title={t('contentBlocker.breathingGate.turnOff')}
                onPress={onConfirm}
                variant="ghost"
                style={styles.fullWidth}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.center}>
              <BreathingText phase={phase} />
              <BreathingCircle phase={phase} />
            </View>

            <View style={styles.timerContainer}>
              <BreathingTimer phase={phase} cycleCount={cycleCount} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  closeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT_SIZE.xxl,
    lineHeight: LINE_HEIGHT.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  confirmCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  confirmTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  confirmBody: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.body,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  buttons: {
    alignSelf: 'stretch',
    gap: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
