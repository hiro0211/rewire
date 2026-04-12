import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { TYPEWRITER_CONFIG, TYPEWRITER_MESSAGE_KEYS } from '@/constants/panic';

export type TypewriterPhase =
  | 'entering'
  | 'typing'
  | 'pausing'
  | 'exiting'
  | 'interval';

interface UseTypewriterMessageReturn {
  displayedText: string;
  phase: TypewriterPhase;
}

/**
 * Drives the typewriter animation for the panic screen's encouragement capsule.
 *
 * Flow per message: entering -> typing -> pausing -> exiting -> interval
 * After the final message it loops back to the first one.
 *
 * Only the internal state transitions live here; the capsule component is
 * responsible for the actual scale/opacity animations.
 */
export function useTypewriterMessage(): UseTypewriterMessageReturn {
  const { t } = useLocale();
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<TypewriterPhase>('entering');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const currentMessage = t(TYPEWRITER_MESSAGE_KEYS[messageIndex]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === 'entering') {
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setCharIndex(0);
        setPhase('typing');
      }, TYPEWRITER_CONFIG.ENTER_DURATION_MS);
      return;
    }

    if (phase === 'typing') {
      if (charIndex < currentMessage.length) {
        timerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setCharIndex((c) => c + 1);
        }, TYPEWRITER_CONFIG.CHAR_INTERVAL_MS);
      } else {
        setPhase('pausing');
      }
      return;
    }

    if (phase === 'pausing') {
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('exiting');
      }, TYPEWRITER_CONFIG.HOLD_DURATION_MS);
      return;
    }

    if (phase === 'exiting') {
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('interval');
      }, TYPEWRITER_CONFIG.EXIT_DURATION_MS);
      return;
    }

    if (phase === 'interval') {
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setMessageIndex((i) => (i + 1) % TYPEWRITER_MESSAGE_KEYS.length);
        setCharIndex(0);
        setPhase('entering');
      }, TYPEWRITER_CONFIG.INTERVAL_MS);
      return;
    }
  }, [phase, charIndex, currentMessage]);

  const displayedText =
    phase === 'entering' || phase === 'interval'
      ? ''
      : currentMessage.slice(0, charIndex);

  return { displayedText, phase };
}
