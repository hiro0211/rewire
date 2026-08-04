import { LAUNCH_PAYWALL_COOLDOWN_DAYS } from '@/constants/paywall/launchPaywall';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 起動時ペイウォールを表示してよいかを判定する純関数。
 *
 * 判定できない入力（未記録・壊れた値・未来日時）はすべて「表示する」に倒す。
 * 抑止側に倒すと、壊れた1件の保存値でペイウォールが恒久的に出なくなり、
 * 収益が静かに失われるため。
 *
 * @param lastShownAtIso 最後に表示した時刻（ISO文字列）。未記録なら null。
 * @param now 現在時刻。
 * @param cooldownDays 再表示までの間隔（日）。
 */
export function shouldShowLaunchPaywall(
  lastShownAtIso: string | null,
  now: Date,
  cooldownDays: number = LAUNCH_PAYWALL_COOLDOWN_DAYS,
): boolean {
  if (!lastShownAtIso) return true;

  const lastShownAt = new Date(lastShownAtIso).getTime();
  if (Number.isNaN(lastShownAt)) return true;

  const elapsedMs = now.getTime() - lastShownAt;
  if (elapsedMs < 0) return true;

  return elapsedMs >= cooldownDays * MS_PER_DAY;
}
