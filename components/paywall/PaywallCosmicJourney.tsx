import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { TRIAL_DAYS } from '@/constants/paywall/paywallTrial';
import { SPACING } from '@/constants/theme';
import { extractOfferingPackages } from '@/hooks/paywall/useOfferingPackages';
import { usePurchase } from '@/hooks/paywall/usePurchase';
import { useLocale } from '@/hooks/useLocale';
import { calcBillingStartDate, formatBillingDate } from '@/lib/paywall/trialBillingDate';
import { trackEvent } from '@/lib/tracking/trackEvent';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PaywallCloseButton } from './PaywallCloseButton';
import { PaywallFooter } from './PaywallFooter';
import { ReviewCarousel } from './ReviewCarousel';
import { CosmicHeadline } from './cosmic/CosmicHeadline';
import { CosmicHeroOrb } from './cosmic/CosmicHeroOrb';
import { CosmicPaywallFooter } from './cosmic/CosmicPaywallFooter';
import { FeatureRowList } from './cosmic/FeatureRowList';
import { PlanOptionList } from './cosmic/PlanOptionList';
import { formatPrice } from './paywallUtils';

type PlanId = 'annual' | 'monthly';

interface PaywallCosmicJourneyProps {
  /** RevenueCat の Offering。型は SDK 依存なので unknown で受けて抽出側に委ねる */
  offering: unknown;
  onDismiss: () => void;
  onPurchaseCompleted: (plan: string) => void;
  onRestoreCompleted: () => void;
}

/**
 * A案ペイウォール「星の旅」。
 *
 * 構成:
 *   閉じる → 天体 → 主張 → 機能一覧 → レビュー → 法的表記+復元（スクロール）
 *   プラン選択 + CTA + 請求文（固定フッター）
 *
 * プランと請求文だけを固定側に置くのは、スクロール位置に関わらず
 * 「何をいくらで買うのか」を常に見せるため。法的表記まで固定にすると
 * 固定領域が画面の半分を占め、機能一覧やレビューが読めなくなる（実測 400pt = 50%）。
 */
export function PaywallCosmicJourney({
  offering,
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallCosmicJourneyProps) {
  const { t, locale } = useLocale();
  // 既定を年額にするのは LTV が大きいため。月額も同じ大きさで並べ、
  // 1タップで選べる状態にしてあるので、選択を奪ってはいない。
  const [preferredPlan, setPreferredPlan] = useState<PlanId>('annual');

  const { annualPackage, monthlyPackage, annualPrice, monthlyPrice, currencyCode } =
    extractOfferingPackages(offering);
  const hasMonthly = !!monthlyPackage;

  // 月額が売られていない Offering では月額を選べない。選択が残っていると
  // 「¥680／月」と見せて年額を請求することになるので、年額へ落とす。
  const selectedPlan: PlanId = hasMonthly ? preferredPlan : 'annual';
  const isAnnual = selectedPlan === 'annual';

  const { purchasing, handlePurchase, handleRestore } = usePurchase({
    package: isAnnual ? annualPackage : monthlyPackage,
    plan: selectedPlan,
    onPurchaseCompleted,
    onRestoreCompleted,
  });

  const handleSelectPlan = (plan: PlanId) => {
    trackEvent('plan_selected', { plan });
    setPreferredPlan(plan);
  };

  const monthlyCurrencyCode = monthlyPackage?.product?.currencyCode ?? currencyCode;

  // 現在時刻の取得は副作用なのでここで1回だけ行い、整形は純関数に任せる
  const billingDate = formatBillingDate(calcBillingStartDate(new Date(), TRIAL_DAYS), locale);
  const selectedPrice = isAnnual
    ? formatPrice(annualPrice, currencyCode)
    : formatPrice(monthlyPrice, monthlyCurrencyCode);
  const billingNote = t(
    isAnnual ? 'paywall.cosmic.billingNoteAnnual' : 'paywall.cosmic.billingNoteMonthly',
    { date: billingDate, price: selectedPrice }
  );

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PaywallCloseButton onPress={onDismiss} />

          <CosmicHeroOrb />
          <CosmicHeadline />

          <View style={styles.section}>
            <FeatureRowList />
          </View>

          <ReviewCarousel />

          {/*
            自動更新の説明・規約/プライバシーのリンク・購入の復元をまとめた末尾ブロック。
            固定フッターではなくここに置く理由:
            DPLA Schedule 2 §3.8(b) は規約類について
            "accessible within Your Licensed Application" としか要求しておらず、
            位置の指定は無い（Review Guidelines 全文に "scroll" の語も無い）。
            設定 > サポート からも同じ画面に行けるので、経路としては二重に満たしている。
            文字サイズと色は固定側にあったときと同一で、小さくして隠してはいない。

            復元を画面上部に単独で出すと、他に何も無い帯にリンクだけが浮いて見える。
            対照群の PaywallDefault も同じ PaywallFooter でまとめているので、
            ユーザーから見た置き場所も揃う。
          */}
          <View testID="paywall-legal-block" style={styles.legal}>
            <PaywallFooter onRestore={handleRestore} purchasing={purchasing} />
          </View>
        </ScrollView>

        <CosmicPaywallFooter
          planSelector={
            <PlanOptionList
              annualPrice={annualPrice}
              monthlyPrice={monthlyPrice}
              currencyCode={currencyCode}
              monthlyCurrencyCode={monthlyCurrencyCode}
              showMonthly={hasMonthly}
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
            />
          }
          billingNote={billingNote}
          purchasing={purchasing}
          onPurchase={handlePurchase}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  section: { marginTop: SPACING.xxl },
  legal: { marginTop: SPACING.xxl, alignItems: 'center' },
});
