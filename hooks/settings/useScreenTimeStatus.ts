import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { screenTimeBridge, type AuthorizationStatusString } from '@/lib/screenTime/screenTimeBridge';

export function useScreenTimeStatus() {
  const [status, setStatus] = useState<AuthorizationStatusString>('notDetermined');

  const check = useCallback(() => {
    setStatus(screenTimeBridge.getAuthorizationStatus());
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
