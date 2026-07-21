import { DEBUG_MENU_ENABLED } from '@/constants/debug';
import { useDebugStore } from '@/stores/debugStore';

/**
 * デバッグプレビュー（オンボーディングスキップ + 全バッジ解放）が
 * 有効かどうかを返す単一の真実源。
 *
 * 二重ゲート:
 *   1. DEBUG_MENU_ENABLED（コンパイル時定数）— リリースビルドでは false
 *   2. debugStore.enabled（設定画面のランタイムトグル）
 *
 * DEBUG_MENU_ENABLED=false のとき、永続化されたトグルが true でも常に false を返す。
 */
export function useDebugUnlockAll(): boolean {
  const enabled = useDebugStore((s) => s.enabled);
  return DEBUG_MENU_ENABLED && enabled;
}
