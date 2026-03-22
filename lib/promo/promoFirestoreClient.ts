import { isExpoGo } from '@/lib/nativeGuard';
import { logger } from '@/lib/logger';
import type { PromoCode, PromoRedemption } from '@/types/promo';

let firestore: any = null;
if (!isExpoGo) {
  try {
    firestore = require('@react-native-firebase/firestore').default;
  } catch {
    // Native module not available
  }
}

export const promoFirestoreClient = {
  async validateCode(code: string): Promise<PromoCode | null> {
    if (!firestore) return null;
    try {
      const normalizedCode = code.toUpperCase().trim();
      const snapshot = await firestore()
        .collection('promoCodes')
        .where('code', '==', normalizedCode)
        .get();

      if (snapshot.empty) return null;

      const data = snapshot.docs[0].data() as PromoCode;
      if (!data.isActive) return null;

      return data;
    } catch (error) {
      logger.warn('PromoFirestore', 'validateCode failed:', error);
      return null;
    }
  },

  async recordRedemption(redemption: PromoRedemption): Promise<void> {
    if (!firestore) return;
    try {
      await firestore().collection('promoRedemptions').add(redemption);
    } catch (error) {
      logger.warn('PromoFirestore', 'recordRedemption failed:', error);
    }
  },

  async isAlreadyRedeemed(userId: string): Promise<boolean> {
    if (!firestore) return false;
    try {
      const snapshot = await firestore()
        .collection('promoRedemptions')
        .where('userId', '==', userId)
        .get();

      return !snapshot.empty;
    } catch (error) {
      logger.warn('PromoFirestore', 'isAlreadyRedeemed failed:', error);
      return false;
    }
  },
};
