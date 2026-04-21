import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { safariWebExtensionBridge } from '@/lib/safariWebExtension/safariWebExtensionBridge';

export function useWebExtensionStatus() {
  const [webExtensionStatus, setWebExtensionStatus] = useState<
    'checking' | 'enabled' | 'unknown'
  >('checking');

  useEffect(() => {
    const check = async () => {
      if (Platform.OS !== 'ios') return;
      const status = await safariWebExtensionBridge.getExtensionStatus();
      setWebExtensionStatus(status.isEnabled ? 'enabled' : 'unknown');
    };

    check();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });

    return () => sub.remove();
  }, []);

  return { webExtensionStatus };
}
