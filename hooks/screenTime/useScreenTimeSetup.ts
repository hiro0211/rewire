import { useState, useCallback } from 'react';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useLocale } from '@/hooks/useLocale';

export type SetupStep = 'idle' | 'requesting' | 'completed' | 'denied' | 'error';

export function useScreenTimeSetup() {
  const [step, setStep] = useState<SetupStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const setEnabled = useScreenTimeStore((s) => s.setEnabled);
  const { t } = useLocale();

  const startSetup = useCallback(async () => {
    setIsLoading(true);
    setStep('requesting');
    try {
      const result = await screenTimeBridge.requestAuthorization();

      if (result.status !== 'approved') {
        setStep('denied');
        return;
      }

      const enabled = await screenTimeBridge.enableAdultSiteBlocking(t);
      if (enabled) {
        await setEnabled(true);
        setStep('completed');
      } else {
        setStep('error');
      }
    } catch {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, [setEnabled, t]);

  const checkStatus = useCallback(async () => {
    const status = screenTimeBridge.getAuthorizationStatus();
    if (status === 'approved') {
      const enabled = await screenTimeBridge.enableAdultSiteBlocking(t);
      if (enabled) {
        await setEnabled(true);
        setStep('completed');
      }
    }
  }, [setEnabled, t]);

  return { step, isLoading, startSetup, checkStatus };
}
