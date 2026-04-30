import { useSubscriptionStore } from '../subscriptionStore';

describe('subscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.getState().reset();
  });

  it('初期状態で subscriptionSynced が false', () => {
    expect(useSubscriptionStore.getState().subscriptionSynced).toBe(false);
  });

  it('markSynced() 呼び出しで subscriptionSynced が true になる', () => {
    useSubscriptionStore.getState().markSynced();
    expect(useSubscriptionStore.getState().subscriptionSynced).toBe(true);
  });

  it('reset() 呼び出しで subscriptionSynced が false に戻る', () => {
    useSubscriptionStore.getState().markSynced();
    useSubscriptionStore.getState().reset();
    expect(useSubscriptionStore.getState().subscriptionSynced).toBe(false);
  });

  it('markSynced() の多重呼び出しは冪等（true のまま）', () => {
    useSubscriptionStore.getState().markSynced();
    useSubscriptionStore.getState().markSynced();
    expect(useSubscriptionStore.getState().subscriptionSynced).toBe(true);
  });
});
