/**
 * 無料トライアルの日数。
 *
 * なぜ定数にするか: RevenueCat の商品設定（introductory offer）および locales の
 * 「3日間無料」表記と一致させること。ズレると見た金額と請求が食い違い、
 * ユーザーからの信頼を直接損なう。変更時は3箇所を必ず同時に更新する。
 */
export const TRIAL_DAYS = 3;
