import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';

export function useContentBlockerStatus(
  currentStep: number,
  onEnabled: () => void
) {
  const onEnabledRef = useRef(onEnabled);
  onEnabledRef.current = onEnabled;

  useEffect(() => {
    if (currentStep < 1) return;

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const status = await contentBlockerBridge.getBlockerStatus();
        if (status.isEnabled) {
          onEnabledRef.current();
        }
      }
    });

    return () => subscription.remove();
  }, [currentStep]);
}
