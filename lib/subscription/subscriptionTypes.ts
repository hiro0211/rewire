export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  willRenew: boolean;
}

export interface SubscriptionPackage {
  identifier: string;
  plan: SubscriptionPlan;
  priceString: string;
  price: number;
  period: string;
}

export interface SubscriptionClient {
  initialize(): Promise<void>;
  getOfferings(): Promise<SubscriptionPackage[]>;
  purchase(packageId: string): Promise<SubscriptionStatus>;
  restorePurchases(): Promise<SubscriptionStatus>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
  addListener(callback: (isPro: boolean) => void): void;
}
