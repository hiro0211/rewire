import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import type {
  SubscriptionClient,
  SubscriptionStatus,
  SubscriptionPackage,
  SubscriptionPlan,
} from './subscriptionTypes';

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';

const ENTITLEMENT_ID = 'pro';

const FREE_STATUS: SubscriptionStatus = {
  isActive: false,
  plan: 'free',
  expiresAt: null,
  willRenew: false,
};

function mapPackageIdToPlan(identifier: string): SubscriptionPlan {
  if (identifier.includes('lifetime')) {
    return 'pro_lifetime';
  }
  if (identifier.includes('annual') || identifier.includes('yearly')) {
    return 'pro_annual';
  }
  if (identifier.includes('monthly')) {
    return 'pro_monthly';
  }
  return 'pro_monthly';
}

function buildStatusFromCustomerInfo(
  customerInfo: { entitlements: { active: Record<string, { expirationDate: string | null; willRenew: boolean; productIdentifier: string }> } },
): SubscriptionStatus {
  const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!proEntitlement) return FREE_STATUS;

  const plan = mapPackageIdToPlan(proEntitlement.productIdentifier);

  return {
    isActive: true,
    plan,
    expiresAt: plan === 'pro_lifetime' ? null : (proEntitlement.expirationDate ?? null),
    willRenew: plan === 'pro_lifetime' ? false : proEntitlement.willRenew,
  };
}

export const subscriptionClient: SubscriptionClient = {
  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);

      const apiKey =
        Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

      await Purchases.configure({ apiKey });
    } catch (error) {
      console.error('[Subscription] initialize failed:', error);
    }
  },

  async getOfferings(): Promise<SubscriptionPackage[]> {
    if (Platform.OS === 'web') return [];
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current || !current.availablePackages) return [];

      return current.availablePackages.map((pkg) => ({
        identifier: pkg.identifier,
        plan: mapPackageIdToPlan(pkg.identifier),
        priceString: pkg.product.priceString,
        price: pkg.product.price,
        period: pkg.packageType,
      }));
    } catch (error) {
      console.error('[Subscription] getOfferings failed:', error);
      return [];
    }
  },

  async purchase(packageId: string): Promise<SubscriptionStatus> {
    if (Platform.OS === 'web') return FREE_STATUS;
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return FREE_STATUS;

      const pkg = current.availablePackages.find((p) => p.identifier === packageId);
      if (!pkg) return FREE_STATUS;

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return buildStatusFromCustomerInfo(customerInfo as any);
    } catch (error) {
      console.error('[Subscription] purchase failed:', error);
      return FREE_STATUS;
    }
  },

  async restorePurchases(): Promise<SubscriptionStatus> {
    if (Platform.OS === 'web') return FREE_STATUS;
    try {
      const customerInfo = await Purchases.restorePurchases();
      return buildStatusFromCustomerInfo(customerInfo as any);
    } catch (error) {
      console.error('[Subscription] restorePurchases failed:', error);
      return FREE_STATUS;
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (Platform.OS === 'web') return FREE_STATUS;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return buildStatusFromCustomerInfo(customerInfo as any);
    } catch (error) {
      console.error('[Subscription] getSubscriptionStatus failed:', error);
      return FREE_STATUS;
    }
  },

  addListener(callback: (isPro: boolean) => void): void {
    if (Platform.OS === 'web') return;
    Purchases.addCustomerInfoUpdateListener((info) => {
      const isPro = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      callback(isPro);
    });
  },
};
