import { create } from 'zustand';

interface SubscriptionState {
  subscriptionSynced: boolean;
}

interface SubscriptionActions {
  markSynced: () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>((set) => ({
  subscriptionSynced: false,
  markSynced: () => set({ subscriptionSynced: true }),
  reset: () => set({ subscriptionSynced: false }),
}));
