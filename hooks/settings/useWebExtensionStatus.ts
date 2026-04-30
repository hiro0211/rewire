import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';
import {
  ACTIVE_WINDOW_SECONDS,
  deriveStatus,
  type WebExtensionStatus,
} from '@/lib/safariWebExtension/deriveStatus';
import { getSetupCompletedAt } from '@/lib/safariWebExtension/setupCompletion';

const GRACE_PERIOD_SECONDS = 90;

export function useWebExtensionStatus() {
  const [webExtensionStatus, setWebExtensionStatus] =
    useState<WebExtensionStatus>('checking');
  const cancelledRef = useRef(false);

  const check = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    const [status, setupCompletedAt] = await Promise.all([
      safariWebExtensionBridge.getExtensionStatus(),
      getSetupCompletedAt(),
    ]);
    if (cancelledRef.current) return;

    const nowSeconds = Date.now() / 1000;
    const baseStatus = deriveStatus({
      lastActiveAt: status.lastActiveAt,
      hasAllUrls: status.hasAllUrls,
      nowSeconds,
    });

    if (
      baseStatus === 'never' &&
      setupCompletedAt > 0 &&
      nowSeconds - setupCompletedAt < GRACE_PERIOD_SECONDS
    ) {
      setWebExtensionStatus('active');
      return;
    }
    setWebExtensionStatus(baseStatus);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      cancelledRef.current = true;
      sub.remove();
    };
  }, [check]);

  return { webExtensionStatus, recheck: check };
}

export { ACTIVE_WINDOW_SECONDS, GRACE_PERIOD_SECONDS };
