import { Linking, Platform } from 'react-native';
import { useQuickActionCallback } from 'expo-quick-actions/hooks';
import { collectDeletionDebugInfo } from '@/lib/feedback/collectDeletionDebugInfo';
import { buildDeletionFeedbackMailto } from '@/lib/feedback/deletionFeedbackEmail';

/**
 * ホーム画面の長押しメニューに表示する「削除理由」アクションの ID。
 * app.config.ts の iosActions[].id と一致させること（不一致だとタップが無反応になる）。
 */
export const DELETION_FEEDBACK_ACTION_ID = 'rewire-delete-feedback';

/**
 * アプリ削除前フィードバック用 Quick Action のハンドラ。
 * 長押しメニューの項目タップ（cold-start の初期アクション含む）で発火し、
 * デバッグ情報入りのサポート宛メール作成画面を開く。
 */
export function useDeletionFeedbackQuickAction(): void {
  useQuickActionCallback(async (action) => {
    if (Platform.OS !== 'ios') return;
    if (action?.id !== DELETION_FEEDBACK_ACTION_ID) return;

    const info = await collectDeletionDebugInfo();
    await Linking.openURL(buildDeletionFeedbackMailto(info));
  });
}
