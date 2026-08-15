import { hoursEnabled } from '../blockerDuration';

/**
 * 「ブロックをONにしてから、何時間後に解除しようとしたか」を出すための計算。
 *
 * この数字が挫折までの時間そのものになるので、丸め方と欠損の扱いを固定する。
 */
describe('hoursEnabled', () => {
  const enabledAt = new Date('2026-08-09T00:00:00Z').getTime();

  it('経過時間を時間単位で返す', () => {
    const now = new Date('2026-08-09T05:00:00Z').getTime();
    expect(hoursEnabled(enabledAt, now)).toBe(5);
  });

  it('1時間未満は 0 になる', () => {
    // 「ONにした直後に解除した」は挫折の中でも最も強い信号なので、
    // 切り上げて 1 にせず 0 のまま残す。
    const now = new Date('2026-08-09T00:20:00Z').getTime();
    expect(hoursEnabled(enabledAt, now)).toBe(0);
  });

  it('端数は切り捨てる（経過「した」時間だけを数える）', () => {
    const now = new Date('2026-08-09T05:59:00Z').getTime();
    expect(hoursEnabled(enabledAt, now)).toBe(5);
  });

  it('長期間でも桁を落とさない', () => {
    const now = new Date('2026-09-08T00:00:00Z').getTime();
    expect(hoursEnabled(enabledAt, now)).toBe(720);
  });

  it('ON にした記録が無いときは null を返す', () => {
    // 0 を返すと「ONにした直後に解除した」と区別できなくなる。
    expect(hoursEnabled(null, Date.now())).toBeNull();
  });

  it('時刻が巻き戻っていても負の値を返さない', () => {
    // 端末の時刻変更やタイムゾーン跨ぎで起こりうる。負の経過時間は
    // BigQuery 側の分布を壊すので 0 に丸める。
    const now = new Date('2026-08-08T00:00:00Z').getTime();
    expect(hoursEnabled(enabledAt, now)).toBe(0);
  });
});
