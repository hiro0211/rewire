import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { calculateStreak } from '@/features/checkin/streakCalculator';
import { useMemo } from 'react';

export const useStreak = () => {
  const { user } = useUserStore();
  const { checkins } = useCheckinStore();

  const streak = useMemo(() => {
    if (!user?.streakStartDate) return 0;
    return calculateStreak(user.streakStartDate, checkins);
  }, [user?.streakStartDate, checkins]);

  return {
    streak,
    goal: user?.goalDays || 30,
    progress: Math.min(streak / (user?.goalDays || 30), 1),
  };
};
