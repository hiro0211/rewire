import { shouldShowLaunchPaywall } from '../launchPaywallCooldown';

const NOW = new Date('2026-08-04T12:00:00.000Z');
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe('shouldShowLaunchPaywall', () => {
  it('一度も表示していないとき表示する', () => {
    expect(shouldShowLaunchPaywall(null, NOW, 7)).toBe(true);
  });

  it('直前に表示したばかりのとき表示しない', () => {
    expect(shouldShowLaunchPaywall(daysAgo(0), NOW, 7)).toBe(false);
  });

  it('クールダウン期間の1日前は表示しない', () => {
    expect(shouldShowLaunchPaywall(daysAgo(6), NOW, 7)).toBe(false);
  });

  it('クールダウン期間ちょうど経過で表示する', () => {
    expect(shouldShowLaunchPaywall(daysAgo(7), NOW, 7)).toBe(true);
  });

  it('クールダウン期間を超えていれば表示する', () => {
    expect(shouldShowLaunchPaywall(daysAgo(30), NOW, 7)).toBe(true);
  });

  it('保存値が壊れているときは表示する', () => {
    // 判定不能なら従来どおり表示側に倒す（機会損失を防ぐ）
    expect(shouldShowLaunchPaywall('not-a-date', NOW, 7)).toBe(true);
  });

  it('保存値が未来日時のときは表示する', () => {
    // 端末時計のずれで未来値が入っても、恒久的に抑止されないようにする
    expect(shouldShowLaunchPaywall(daysAgo(-3), NOW, 7)).toBe(true);
  });
});
