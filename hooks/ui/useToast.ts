import { useCallback, useEffect, useRef, useState } from 'react';

export const TOAST_DEFAULT_DURATION_MS = 1800;

interface UseToastResult {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

/**
 * 一時表示トーストの表示制御。show() で表示し、durationMs 経過で自動的に隠す。
 * アンマウント時にタイマーをクリーンアップする。
 */
export function useToast(
  durationMs: number = TOAST_DEFAULT_DURATION_MS,
): UseToastResult {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const show = useCallback(() => {
    clear();
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), durationMs);
  }, [clear, durationMs]);

  const hide = useCallback(() => {
    clear();
    setVisible(false);
  }, [clear]);

  return { visible, show, hide };
}
