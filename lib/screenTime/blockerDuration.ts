const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * ブロックを有効にしてからの経過時間（時間単位）。
 *
 * 「ポルノ禁を始めて、どれくらい持ったか」そのものの数字になる。解除を試みた
 * イベントにこれを載せることで、BigQuery 側で挫折までの時間の分布が出せる。
 *
 * 切り捨てなのは、ONにした直後の解除（= 最も強い挫折シグナル）を 0 として
 * 残したいため。切り上げると 1 に混ざって見えなくなる。
 *
 * @param enabledAt 直近でブロックを有効にした時刻（epoch ms）。未設定なら null。
 * @returns 経過時間。有効化の記録が無いときは null（0 と区別する）。
 */
export function hoursEnabled(
  enabledAt: number | null | undefined,
  now: number = Date.now(),
): number | null {
  if (enabledAt == null) return null;
  // 端末の時刻変更で now < enabledAt になりうる。負の経過時間を送ると
  // 集計側の分布が壊れるので 0 に丸める。
  return Math.max(0, Math.floor((now - enabledAt) / MS_PER_HOUR));
}
