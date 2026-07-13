import { useState, useCallback } from 'react';
import { screenTimeBridge } from '@/lib/screenTime/screenTimeBridge';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useLocale } from '@/hooks/useLocale';

export type SetupStep =
  | 'idle'
  | 'requesting'
  | 'picking'
  | 'completed'
  | 'denied'
  | 'error';

export interface PendingSelection {
  familyActivitySelection: string;
  applicationCount: number;
}

export function useScreenTimeSetup() {
  const [step, setStep] = useState<SetupStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);

  const setSelection = useScreenTimeStore((s) => s.setSelection);
  const markShielded = useScreenTimeStore((s) => s.markShielded);
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
      setPendingSelection(null);
      setStep('picking');
    } catch {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePickerChange = useCallback(
    (familyActivitySelection: string, applicationCount: number) => {
      if (!familyActivitySelection || applicationCount <= 0) {
        setPendingSelection(null);
        return;
      }
      setPendingSelection({ familyActivitySelection, applicationCount });
    },
    [],
  );

  const finalizePicker = useCallback(async () => {
    if (!pendingSelection) {
      setStep('idle');
      return;
    }
    setIsLoading(true);
    try {
      const persisted = screenTimeBridge.persistSelection(
        pendingSelection.familyActivitySelection,
      );
      if (!persisted) {
        setStep('error');
        return;
      }
      const applied = screenTimeBridge.applyAppShield(t);
      if (!applied) {
        setStep('error');
        return;
      }
      await setSelection(
        pendingSelection.familyActivitySelection,
        pendingSelection.applicationCount,
      );
      await markShielded();
      setStep('completed');
    } catch {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, [pendingSelection, setSelection, markShielded, t]);

  const cancelPicker = useCallback(() => {
    setPendingSelection(null);
    setStep('idle');
  }, []);

  // 購入後オンボーディング用: スクリーンタイムの許可のみを取得する。
  // 実際のブロック開始（フィルター適用）はユーザーがブロックボタンを押したときに行うため、
  // ここでは applyAppShield/markShielded を呼ばない。
  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setStep('requesting');
    try {
      const result = await screenTimeBridge.requestAuthorization();
      setStep(result.status === 'approved' ? 'completed' : 'denied');
    } catch {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    step,
    isLoading,
    pendingSelection,
    startSetup,
    requestPermission,
    handlePickerChange,
    finalizePicker,
    cancelPicker,
  };
}
