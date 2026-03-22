import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE, LAYOUT, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { promoFirestoreClient } from '@/lib/promo/promoFirestoreClient';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { ROUTES } from '@/lib/routing/routes';
import { Platform } from 'react-native';
import type { PromoCode } from '@/types/promo';

type PromoState = 'idle' | 'validating' | 'valid' | 'invalid' | 'already_redeemed' | 'error';

export default function PromoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { user } = useUserStore();

  const [code, setCode] = useState('');
  const [state, setState] = useState<PromoState>('idle');
  const [validatedPromo, setValidatedPromo] = useState<PromoCode | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setState('validating');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analyticsClient.logEvent('promo_code_entered', { code: code.toUpperCase().trim() });

    const userId = user?.id ?? 'unknown';
    const alreadyRedeemed = await promoFirestoreClient.isAlreadyRedeemed(userId);
    if (alreadyRedeemed) {
      setState('already_redeemed');
      return;
    }

    const promoCode = await promoFirestoreClient.validateCode(code);
    if (!promoCode) {
      setState('invalid');
      return;
    }

    analyticsClient.logEvent('promo_code_validated', {
      code: promoCode.code,
      source: promoCode.source,
    });
    setValidatedPromo(promoCode);
    setState('valid');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStartSurvey = () => {
    if (!validatedPromo) return;
    router.replace({
      pathname: '/survey',
      params: {
        promoCode: validatedPromo.code,
        promoSource: validatedPromo.source,
      },
    } as any);
  };

  const handleClose = () => {
    router.back();
  };

  const getErrorMessage = (): string | null => {
    switch (state) {
      case 'invalid':
        return t('promo.invalid');
      case 'already_redeemed':
        return t('promo.alreadyRedeemed');
      case 'error':
        return t('promo.networkError');
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage();
  const isButtonDisabled = !code.trim() || state === 'validating';

  if (state === 'valid') {
    return (
      <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={48} color={colors.contrastText} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {t('promo.successTitle')}
          </Text>
          <Text style={[styles.successBody, { color: colors.textSecondary }]}>
            {t('promo.successBody')}
          </Text>
          <Button title={t('promo.startSurvey')} onPress={handleStartSurvey} />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.closeButton}>
          <Ionicons
            name="close"
            size={24}
            color={colors.text}
            onPress={handleClose}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('promo.title')}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.pillBackground,
              borderColor: errorMessage ? colors.error : colors.border,
            },
          ]}
          value={code}
          onChangeText={(text) => {
            setCode(text.toUpperCase());
            if (state !== 'idle' && state !== 'validating') {
              setState('idle');
            }
          }}
          placeholder={t('promo.inputPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleApply}
        />

        {errorMessage && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorMessage}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={state === 'validating' ? t('promo.validating') : t('promo.apply')}
          onPress={handleApply}
          disabled={isButtonDisabled}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.xl,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  input: {
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  successTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  successBody: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
});
