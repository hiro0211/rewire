import { BADGE_DEFINITIONS } from '../BADGE_DEFINITIONS';

/** i18n抽出用のメッセージマップ。将来のロケール分離に備える。 */
export const badgeMessagesJa: Record<string, string> = Object.fromEntries(
  BADGE_DEFINITIONS.map((b) => [b.id, b.message])
);
