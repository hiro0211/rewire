import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface PaywallFeature {
  readonly icon: IoniconName;
  readonly titleKey: string;
}

/**
 * ペイウォールで並べる機能。説明文は付けず、1行の見出しだけを縦に積む。
 *
 * 説明文を落としたのは、購入直前に読ませたいのは「何ができるか」の一覧であって
 * 個々の解説ではないため。5行を数秒で見渡せることを優先する。
 * 文言は既存の paywall.features.* をそのまま使う（対照群と同じ約束を見せる）。
 */
export const PAYWALL_FEATURES: readonly PaywallFeature[] = [
  { icon: 'shield-checkmark-outline', titleKey: 'paywall.features.blocker.title' },
  { icon: 'time-outline', titleKey: 'paywall.features.widget.title' },
  { icon: 'fitness-outline', titleKey: 'paywall.features.sos.title' },
  { icon: 'moon-outline', titleKey: 'paywall.features.reflection.title' },
  { icon: 'planet-outline', titleKey: 'paywall.features.badges.title' },
];
