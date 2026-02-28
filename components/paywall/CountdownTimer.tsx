import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle } from 'react-native';
import { COLORS, FONT_SIZE } from '@/constants/theme';

interface CountdownTimerProps {
  initialSeconds: number;
  style?: TextStyle;
}

export function CountdownTimer({ initialSeconds, style }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

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
