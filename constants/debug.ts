/**
 * 開発用デバッグメニューの表示フラグ。
 *
 * true のとき、設定画面に「オンボーディングをもう一度見る」などの
 * 開発用メニューが表示される。
 *
 * ⚠️ archive / TestFlight / App Store 提出ビルドの前には必ず false に戻すこと。
 *    （release-testflight / EAS Build / Xcode Archive 前の必須チェック項目）
 */
export const DEBUG_MENU_ENABLED = false;

/**
 * デバッグの「全バッジ解放」トグルが有効なときに、ストリーク日数として扱う値。
 * 最終バッジ（cosmos = Day 1095）を確実に上回る大きな値にすることで、
 * 全 18 バッジをアンロック済みとして表示する。
 *
 * ⚠️ この値の効果は必ず DEBUG_MENU_ENABLED と debugStore.enabled の
 *    二重ゲートを通す（`useDebugUnlockAll`）。DEBUG_MENU_ENABLED=false の
 *    リリースビルドでは、フラグが永続化されていても一切影響しない。
 */
export const DEBUG_UNLOCK_DAYS = 100000;
