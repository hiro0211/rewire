import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS, LINE_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useScreenTimeSetup } from '@/hooks/screenTime/useScreenTimeSetup';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { PermissionArrow } from '@/components/ui/PermissionArrow';

interface ScreenTimePermissionStepProps {
  onComplete: () => void;
}

/**
 * 課金後オンボーディング: スクリーンタイム（Family Controls）の許可のみを取得する。
 * 実際のブロック開始（フィルター適用）は次のブロック開始ステップでユーザーが
 * ブロックボタンを押したときに行う。ここでは許可ダイアログを出すだけ。
 * 完了・拒否・エラーいずれでも onComplete で次ステップへ進む。
 */
export function ScreenTimePermissionStep({ onComplete }: ScreenTimePermissionStepProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { step, isLoading, requestPermission } = useScreenTimeSetup();

  // 未決定のときだけ、マウント時にネイティブ許可ダイアログを自動起動する。
  // Why: iOS は notDetermined のときしかダイアログを出さない。許可済み端末で
  // 自動起動すると、ユーザーが読む前に画面が進んでしまう。
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (screenTimeBridge.getAuthorizationStatus() === 'notDetermined') {
      void requestPermission();
    }
  }, [requestPermission]);

  // 完了・拒否・エラーのいずれでも次ステップへ進める
  useEffect(() => {
    if (step === 'completed' || step === 'denied' || step === 'error') {
      onComplete();
    }
  }, [step, onComplete]);

  const showManualButton = step === 'idle' || step === 'denied';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="hourglass-outline" size={48} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {t('postPurchaseOnboarding.screenTimePermission.title')}
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('postPurchaseOnboarding.screenTimePermission.description')}
      </Text>

      {showManualButton && (
        <TouchableOpacity
          style={[styles.enableButton, isLoading && styles.disabledButton]}
          onPress={() => void requestPermission()}
          disabled={isLoading}
          activeOpacity={0.8}
          testID="screen-time-enable-button"
        >
          <Text style={styles.enableButtonText}>
            {t('postPurchaseOnboarding.screenTimePermission.enableButton')}
          </Text>
        </TouchableOpacity>
      )}

      {step === 'requesting' && (
        <PermissionArrow hint={t('postPurchaseOnboarding.screenTimePermission.arrowHint')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: LINE_HEIGHT.xl,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: LINE_HEIGHT.lg,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
