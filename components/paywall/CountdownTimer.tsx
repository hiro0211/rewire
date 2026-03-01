import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle } from 'react-native';
import { COLORS, FONT_SIZE } from '@/constants/theme';

interface CountdownTimerProps {
  initialSeconds: number;
  style?: TextStyle;
  onExpire?: () => void;
}

export function CountdownTimer({ initialSeconds, style, onExpire }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep ref in sync without re-triggering effect
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // onExpireをsetState外から呼ぶことで "Cannot update a component while rendering" エラーを防ぐ
  useEffect(() => {
    if (seconds === 0) {
      onExpireRef.current?.();
    }
  }, [seconds]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const display = initialSeconds >= 3600
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <Text
      testID="countdown-timer"
      style={[
        {
          color: COLORS.text,
          fontSize: FONT_SIZE.lg,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    >
      {display}
    </Text>
  );
}
