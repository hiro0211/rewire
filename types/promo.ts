export interface PromoCode {
  code: string;
  source: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export interface PromoRedemption {
  userId: string;
  code: string;
  source: string;
  redeemedAt: string;
  platform: 'ios' | 'android';
  appVersion: string;
}
