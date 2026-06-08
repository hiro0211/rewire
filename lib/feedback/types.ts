/**
 * アプリ削除前フィードバックメールに同梱するデバッグ情報。
 * 値は collectDeletionDebugInfo で正規化済み（取得失敗時はフォールバック文字列が入る）。
 */
export interface DeletionDebugInfo {
  appVersion: string; // 例: "2.1.0"
  buildNumber: string; // 例: "42"
  iosVersion: string; // 例: "26.5"
  iosBuildId: string; // 例: "23F77"
  deviceModelId: string; // 例: "iPhone17,5"
  languageTag: string; // 例: "ja-JP"
  timezone: string; // 例: "Asia/Tokyo"
}

/** メール作成画面に渡すフィールド一式 */
export interface DeletionFeedbackEmail {
  to: string;
  subject: string;
  body: string;
}
