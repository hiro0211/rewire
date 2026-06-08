const mockSetUserProperty = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    setUserProperty: (...args: any[]) => mockSetUserProperty(...args),
  },
}));

import { setRetentionUserProperties } from '../retentionUserProperties';

describe('setRetentionUserProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('current_streak と relapse_count を文字列で設定する', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    setRetentionUserProperties(fiveDaysAgo, []);

    expect(mockSetUserProperty).toHaveBeenCalledWith('current_streak', '5');
    expect(mockSetUserProperty).toHaveBeenCalledWith('relapse_count', '0');
  });

  it('streakStartDate が無い場合 current_streak は 0', () => {
    setRetentionUserProperties(undefined, []);

    expect(mockSetUserProperty).toHaveBeenCalledWith('current_streak', '0');
  });
});
