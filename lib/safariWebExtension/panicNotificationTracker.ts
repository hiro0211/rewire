let lastPanicNotifiedAt = 0;

export const panicNotificationTracker = {
  getLastPanicNotifiedAt(): number {
    return lastPanicNotifiedAt;
  },
  recordPanicNotification(timestampMs: number = Date.now()): void {
    lastPanicNotifiedAt = timestampMs;
  },
  reset(): void {
    lastPanicNotifiedAt = 0;
  },
};
