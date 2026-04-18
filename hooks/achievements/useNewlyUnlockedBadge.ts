import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';
import { useStreak } from '@/hooks/dashboard/useStreak';
import type { NeuralBadgeDefinition } from '@/constants/badges/BADGE_DEFINITIONS';

const STORAGE_KEY = 'seen_badge_ids';

async function loadSeenIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function saveSeenIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

/**
 * 現在の streak から取得した現在バッジが未表示かどうかを検知する。
 * 新規アンロックバッジがあれば `newBadge` に返し、`dismiss()` で既読化する。
 */
export function useNewlyUnlockedBadge(): {
  newBadge: NeuralBadgeDefinition | null;
  dismiss: () => void;
} {
  const { streak } = useStreak();
  const [newBadge, setNewBadge] = useState<NeuralBadgeDefinition | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const badge = getBadgeByDay(streak);
      const seenIds = await loadSeenIds();

      if (cancelled) return;

      if (!seenIds.includes(badge.id)) {
        setNewBadge(badge);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [streak]);

  const dismiss = useCallback(() => {
    setNewBadge((prev) => {
      if (prev) {
        loadSeenIds().then((ids) => {
          if (!ids.includes(prev.id)) {
            saveSeenIds([...ids, prev.id]);
          }
        });
      }
      return null;
    });
  }, []);

  return { newBadge, dismiss };
}
