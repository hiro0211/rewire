const mockLogEvent = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logEvent: (...args: any[]) => mockLogEvent(...args),
  },
}));

import { trackEvent } from '../trackEvent';

describe('trackEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('params 付きイベントを analyticsClient.logEvent に委譲する', () => {
    trackEvent('lesson_started', { lesson_id: 'lesson-1' });

    expect(mockLogEvent).toHaveBeenCalledWith('lesson_started', {
      lesson_id: 'lesson-1',
    });
  });

  it('params 無しイベントを委譲する（第2引数なし）', () => {
    trackEvent('achievements_opened');

    expect(mockLogEvent).toHaveBeenCalledWith('achievements_opened');
  });
});
