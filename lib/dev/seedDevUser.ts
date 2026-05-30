import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types/models';

const buildDevUser = (): User => {
  const now = new Date().toISOString();
  return {
    id: 'dev-user',
    nickname: 'Dev',
    goalDays: 30,
    streakStartDate: now,
    isPro: true,
    notifyTime: '21:00',
    notifyEnabled: true,
    createdAt: now,
    consentGivenAt: now,
    ageVerifiedAt: now,
    hasCompletedPostPurchaseOnboarding: true,
  };
};

export const seedDevUser = async (): Promise<void> => {
  const { user, setUser } = useUserStore.getState();
  if (user) return;
  await setUser(buildDevUser());
};
