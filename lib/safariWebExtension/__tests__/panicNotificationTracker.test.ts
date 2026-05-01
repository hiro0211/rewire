import { panicNotificationTracker } from '../panicNotificationTracker';

describe('panicNotificationTracker', () => {
  beforeEach(() => {
    panicNotificationTracker.reset();
  });

  it('初期状態は 0 を返す', () => {
    expect(panicNotificationTracker.getLastPanicNotifiedAt()).toBe(0);
  });

  it('recordPanicNotification で渡したタイムスタンプ(ms)を保持する', () => {
    panicNotificationTracker.recordPanicNotification(1700000000000);
    expect(panicNotificationTracker.getLastPanicNotifiedAt()).toBe(1700000000000);
  });

  it('引数なし呼び出しでは Date.now() を保持する', () => {
    const before = Date.now();
    panicNotificationTracker.recordPanicNotification();
    const recorded = panicNotificationTracker.getLastPanicNotifiedAt();
    expect(recorded).toBeGreaterThanOrEqual(before);
    expect(recorded).toBeLessThanOrEqual(Date.now());
  });

  it('reset で 0 に戻る', () => {
    panicNotificationTracker.recordPanicNotification(1700000000000);
    panicNotificationTracker.reset();
    expect(panicNotificationTracker.getLastPanicNotifiedAt()).toBe(0);
  });
});
