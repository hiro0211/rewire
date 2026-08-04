/**
 * RevenueCat の entitlement 識別子。
 *
 * ダッシュボード側の設定と1文字でも違うと、決済は成立するのに Pro にならない。
 * 以前は usePurchase / subscriptionClient / useAppInitialization の3箇所に
 * 同じ文字列がハードコードされており、片方だけ直すと不整合になる状態だった。
 */
export const PRO_ENTITLEMENT_ID = 'Rewire Pro';
