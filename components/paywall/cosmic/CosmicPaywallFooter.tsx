import { Button } from '@/components/ui/Button';
import { FONT_SIZE, LINE_HEIGHT, SPACING } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CosmicPaywallFooterProps {
  /** プラン選択。CTA の直上に置くので固定フッター側が受け持つ */
  planSelector: React.ReactNode;
  /** 選択中プランの請求文（補間済み）。整形は呼び出し側の責務 */
  billingNote: string;
  purchasing: boolean;
  onPurchase: () => void;
}

/**
 * スクロールに追従しない固定フッター（プラン選択 + CTA + 請求文）。
 *
 * ここに残すのは「購入の判断に直接要るもの」だけ。押す直前が最後の確認点で、
 * スクロールの途中に置くと読まずに CTA を押せてしまい、次に金額を見るのが
 * Apple の決済シートになる（購入開始16件中12件がそこで自らキャンセルした実測の原因）。
 *
 * 逆に、自動更新の定型文・規約/プライバシーのリンク・購入の復元はここに置かない。
 * 固定領域が画面の半分を占めて本文が読めなくなるうえ、Apple の要求単位は
 * 「sign-up screen（画面）」であってファーストビューではない。
 * Review Guidelines 全文に "scroll" の語は無く、DPLA Schedule 2 §3.8(b) も
 * 規約類については "accessible within Your Licensed Application" としか言っていない。
 * 復元だけは必須3項目なので、沈めずにヘッダー（CosmicPaywallHeader）へ出している。
 */
export function CosmicPaywallFooter({
  planSelector,
  billingNote,
  purchasing,
  onPurchase,
}: CosmicPaywallFooterProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="cosmic-paywall-footer"
      style={[
        styles.footer,
        {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + SPACING.sm,
        },
      ]}
    >
      <View style={styles.planSlot}>{planSelector}</View>
      <Button
        title={t('paywall.startFree')}
        onPress={onPurchase}
        variant="gradient"
        size="lg"
        loading={purchasing}
        disabled={purchasing}
        style={styles.ctaButton}
      />
      <Text style={[styles.billingNote, { color: colors.textSecondary }]}>{billingNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  planSlot: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    width: '100%',
  },
  billingNote: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
    lineHeight: LINE_HEIGHT.xs,
    textAlign: 'center',
  },
});
