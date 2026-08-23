import {
  isPaywallVariant,
  type PaywallVariant,
} from '@/constants/paywall/paywallExperiment';

/**
 * デバッグ用のバリアント強制指定を解決する。
 *
 * 通常のバリアントは `user.id` のハッシュで決まるため、開発者の端末が
 * どちらに割り当てられるかは選べない。片方のペイウォールを一生見られない
 * 状態では現物を目視確認できないので、設定画面のデバッグメニューから
 * ルートパラメータで上書きできるようにする。
 *
 * `debugMenuEnabled` を引数で受け取るのは、この関数を純粋に保つため。
 * 呼び出し側（`useDebugPaywallVariant`）が `DEBUG_MENU_ENABLED` を渡す。
 * リリースビルドでは常に false なので、パラメータ付きのディープリンクを
 * 踏まれても上書きは効かない。
 *
 * 語彙照合を必ず通すのは、未知の文字列がそのまま variant として流れると
 * 存在しないコンポーネントに分岐して白画面になるため。
 */
export function resolveDebugPaywallVariant(
  raw: string | string[] | undefined,
  debugMenuEnabled: boolean,
): PaywallVariant | null {
  if (!debugMenuEnabled) return null;

  // useLocalSearchParams は同名パラメータが複数あると配列を返す
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isPaywallVariant(value) ? value : null;
}
