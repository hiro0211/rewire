import { useState, useCallback } from 'react';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';

export type SetupStep = 'idle' | 'requesting' | 'completed' | 'denied' | 'error';

export function useScreenTimeSetup() {
  const [step, setStep] = useState<SetupStep>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = useCallback(async () => {
    setIsLoading(true);
    setStep('requesting');
    try {
      const result = await screenTimeBridge.requestAuthorization();

      if (result.status !== 'approved') {
        setStep('denied');
        return;
      }

      const enabled = await screenTimeBridge.enableWebContentFilter();
      setStep(enabled ? 'completed' : 'error');
    } catch {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    const status = await screenTimeBridge.getAuthorizationStatus();
    if (status === 'approved') {
      const enabled = await screenTimeBridge.enableWebContentFilter();
      if (enabled) {
        setStep('completed');
      }
    }
  }, []);

  return { step, isLoading, startSetup, checkStatus };
}
