import { ACTIVE_WINDOW_SECONDS, deriveStatus } from '../deriveStatus';

const NOW = 1700000000;

describe('deriveStatus', () => {
  it('lastActiveAt が 0 のとき never を返す（heartbeat 一度も無し）', () => {
    expect(
      deriveStatus({ lastActiveAt: 0, hasAllUrls: true, nowSeconds: NOW })
    ).toBe('never');
  });

  it('lastActiveAt > 0 で window 内 かつ hasAllUrls=true なら active', () => {
    expect(
      deriveStatus({
        lastActiveAt: NOW - 60 * 60,
        hasAllUrls: true,
        nowSeconds: NOW,
      })
    ).toBe('active');
  });

  it('lastActiveAt > 0 で window 内 かつ hasAllUrls=false なら needsAllUrls', () => {
    expect(
      deriveStatus({
        lastActiveAt: NOW - 60 * 60,
        hasAllUrls: false,
        nowSeconds: NOW,
      })
    ).toBe('needsAllUrls');
  });

  it('lastActiveAt > 0 で window 超過なら stale（hasAllUrls 不問）', () => {
    expect(
      deriveStatus({
        lastActiveAt: NOW - (ACTIVE_WINDOW_SECONDS + 1),
        hasAllUrls: true,
        nowSeconds: NOW,
      })
    ).toBe('stale');
    expect(
      deriveStatus({
        lastActiveAt: NOW - (ACTIVE_WINDOW_SECONDS + 1),
        hasAllUrls: false,
        nowSeconds: NOW,
      })
    ).toBe('stale');
  });

  it('境界値: delta === ACTIVE_WINDOW_SECONDS は stale 側', () => {
    expect(
      deriveStatus({
        lastActiveAt: NOW - ACTIVE_WINDOW_SECONDS,
        hasAllUrls: true,
        nowSeconds: NOW,
      })
    ).toBe('stale');
  });

  it('ACTIVE_WINDOW_SECONDS は 6 時間（21600 秒）', () => {
    expect(ACTIVE_WINDOW_SECONDS).toBe(6 * 60 * 60);
  });
});
