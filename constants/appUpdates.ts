/**
 * アプリ更新まわりの定数。
 */

/** App Store のアプリページ（強制アップデート誘導先） */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6759087214';

/**
 * 「新機能のお知らせ」モーダルの対象バージョン。
 *
 * この値と AsyncStorage の既読バージョンが一致しない既存ユーザーに一度だけ
 * モーダルを表示する。大きな機能刷新を告知するときにこの値を上げること。
 */
export const WHATS_NEW_VERSION = '2.3.0';
