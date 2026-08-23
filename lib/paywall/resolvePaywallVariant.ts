import {
  PAYWALL_EXPERIMENT_ID,
  PAYWALL_VARIANTS,
  PAYWALL_VARIANT_FALLBACK,
  PAYWALL_VARIANT_WEIGHTS,
  type PaywallVariant,
} from '@/constants/paywall/paywallExperiment';
import { assignVariant } from '@/lib/experiment/assignVariant';

/**
 * user.id からペイウォールのバリアントを決める。
 *
 * 同期・純関数なので描画中にそのまま呼べる。割当を保存しないため
 * 「読み込み中は default → 確定後に差し替え」というチラつきが起きない。
 *
 * 実験IDを種の接頭辞に混ぜるのは、次の実験で同じ user.id を使い回しても
 * 割当が前回と相関しないようにするため（キャリーオーバー効果の遮断）。
 */
export function resolvePaywallVariant(userId: string | null | undefined): PaywallVariant {
  // ペイウォール到達時点では user.id は必ず存在するが、
  // 万一の未ハイドレート時に実験へ引き込まず既存挙動へ倒す
  if (!userId) {
    return PAYWALL_VARIANT_FALLBACK;
  }

  return assignVariant(
    `${PAYWALL_EXPERIMENT_ID}:${userId}`,
    PAYWALL_VARIANTS,
    PAYWALL_VARIANT_WEIGHTS
  );
}
