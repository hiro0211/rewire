import { useState, useEffect } from 'react';
import { Platform, AppState } from 'react-native';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';

export function useBlockerStatus() {
  const [blockerStatus, setBlockerStatus] = useState<'checking' | 'enabled' | 'disabled'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      if (Platform.OS === 'ios') {
        const status = await contentBlockerBridge.getBlockerStatus();
        setBlockerStatus(status.isEnabled ? 'enabled' : 'disabled');
      }
    };

    checkStatus();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkStatus();
    });

    return () => sub.remove();
  }, []);

  return { blockerStatus };
}
