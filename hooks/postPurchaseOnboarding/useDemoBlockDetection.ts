import { useCallback, useRef, useState } from 'react';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import { panicNotificationTracker } from '@/lib/safariWebExtension/panicNotificationTracker';

interface UseDemoBlockDetectionOptions {
  graceMs?: number;
}

interface UseDemoBlockDetectionResult {
  blockFired: boolean | null;
  registerTestStart: () => void;
  evaluate: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_GRACE_MS = 60_000;

export function useDemoBlockDetection(
  options: UseDemoBlockDetectionOptions = {},
): UseDemoBlockDetectionResult {
  const { graceMs = DEFAULT_GRACE_MS } = options;
  const [blockFired, setBlockFired] = useState<boolean | null>(null);
  const refTimestampMs = useRef<number | null>(null);
  const blockFiredRef = useRef<boolean | null>(null);

  blockFiredRef.current = blockFired;

  const registerTestStart = useCallback(() => {
    refTimestampMs.current = Date.now();
    setBlockFired(null);
  }, []);

  const reset = useCallback(() => {
    refTimestampMs.current = null;
    setBlockFired(null);
  }, []);

  const evaluate = useCallback(async () => {
    const startedAt = refTimestampMs.current;
    if (startedAt == null) return;
    if (blockFiredRef.current === true) return;

    let blockedAtMs = 0;
    try {
      const status = await safariWebExtensionBridge.getExtensionStatus();
      blockedAtMs = (status.lastBlockedAt ?? 0) * 1000;
    } catch {
      blockedAtMs = 0;
    }
    const panicNotifiedAtMs = panicNotificationTracker.getLastPanicNotifiedAt();

    if (blockedAtMs >= startedAt || panicNotifiedAtMs >= startedAt) {
      setBlockFired(true);
      return;
    }

    if (Date.now() - startedAt >= graceMs) {
      setBlockFired(false);
    }
  }, [graceMs]);

  return { blockFired, registerTestStart, evaluate, reset };
}
