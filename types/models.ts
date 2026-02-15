import type { SubscriptionPlan } from '../lib/subscription/subscriptionTypes';

export interface User {
  id: string;
  nickname: string;
  goalDays: number;
  streakStartDate: string | null;
  isPro: boolean;
  notifyTime: string;
  notifyEnabled: boolean;
  createdAt: string;
  consentGivenAt: string | null;
  ageVerifiedAt: string | null;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: string | null;
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  watchedPorn: boolean;
  urgeLevel: 0 | 1 | 2 | 3 | 4;
  stressLevel: 0 | 1 | 2 | 3 | 4;
  qualityOfLife: 1 | 2 | 3 | 4 | 5;
  memo: string;
  createdAt: string;
}

export interface BreathSession {
  id: string;
  userId: string;
  totalCycles: number;
  urgeResolved: boolean;
  createdAt: string;
}

export interface Recovery {
  id: string;
  userId: string;
  checkinId: string;
  trigger: string;
  symptom?: string; // Optional field for future
  actionTaken?: string; // e.g., 'breathing', 'article'
  journal?: string; // Pro feature
  createdAt: string;
}

export const CHECKIN_DATE_FORMAT = 'yyyy-MM-dd';
