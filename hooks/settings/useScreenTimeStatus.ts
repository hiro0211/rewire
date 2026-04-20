import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import type { AuthorizationStatus } from '@/lib/screenTime/screenTimeTypes';

export function useScreenTimeStatus() {
  const [status, setStatus] = useState<AuthorizationStatus>('notDetermined');

  const check = useCallback(async () => {
    const s = await screenTimeBridge.getAuthorizationStatus();
    setStatus(s);
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  return { screenTimeStatus: status, refreshStatus: check };
}
