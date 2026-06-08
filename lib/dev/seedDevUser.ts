import { useUserStore } from '@/stores/userStore';
import type { User } from '@/types/models';

const buildDevUser = (): User => {
  const now = new Date().toISOString();
  // 撮影用デモ: 42日前を開始日にして Day 42 を表示（撮影後に now へ戻すこと）
  const streakStart = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: 'dev-user',
    nickname: 'Dev',
    goalDays: 90,
    streakStartDate: streakStart,
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
