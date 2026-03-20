import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { t } from '@/locales/i18n';

const ANALYSIS_ITEMS = [
  { textKey: 'analyzing.collectingData', duration: 2000 },
  { textKey: 'analyzing.analyzingPatterns', duration: 2000 },
  { textKey: 'analyzing.calculatingImpact', duration: 1500 },
  { textKey: 'analyzing.generatingResult', duration: 1500 },
];

const TOTAL_DURATION = ANALYSIS_ITEMS.reduce((sum, item) => sum + item.duration, 0);

export { ANALYSIS_ITEMS, TOTAL_DURATION };

export function useAnalyzingProgress(onComplete: () => void) {
  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const itemFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;
  const checkFades = useRef(ANALYSIS_ITEMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (TOTAL_DURATION / 70));
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 70);

    Animated.timing(itemFades[0], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    ANALYSIS_ITEMS.forEach((item, index) => {
      if (index > 0) {
        const showTimeout = setTimeout(() => {
          Animated.timing(itemFades[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, elapsed);
        timeouts.push(showTimeout);
      }

      elapsed += item.duration;

      const completeTimeout = setTimeout(() => {
        setCompletedCount(index + 1);

        Animated.timing(checkFades[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        if (index < 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (index === 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, elapsed);
      timeouts.push(completeTimeout);
    });

    const advanceTimeout = setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION + 500);
    timeouts.push(advanceTimeout);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { progress, completedCount, itemFades, checkFades };
}
