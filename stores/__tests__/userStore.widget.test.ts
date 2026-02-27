const mockSave = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    save: (...args: any[]) => mockSave(...args),
    get: () => mockGet(),
  },
}));

jest.mock('@/lib/storage/asyncStorageClient', () => ({
  asyncStorageClient: {
    clearAll: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/stores/checkinStore', () => ({
  useCheckinStore: { getState: () => ({ reset: jest.fn(), checkins: [] }) },
}));

jest.mock('@/stores/breathStore', () => ({
  useBreathStore: { getState: () => ({ reset: jest.fn() }) },
}));

const mockSyncWidgetData = jest.fn().mockResolvedValue(undefined);
const mockClearWidgetData = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/widget/widgetDataSync', () => ({
  syncWidgetData: (...args: any[]) => mockSyncWidgetData(...args),
  clearWidgetData: () => mockClearWidgetData(),
}));

import { useUserStore } from '../userStore';

const TEST_USER = {
  id: 'test-id',
  nickname: 'TestUser',
  goalDays: 30,
  streakStartDate: '2025-01-01',
  isPro: false,
  notifyTime: '22:00',
  notifyEnabled: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  consentGivenAt: '2025-01-01T00:00:00.000Z',
  ageVerifiedAt: null,
};

describe('userStore widget sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({ user: null, isLoading: false, hasHydrated: false });
  });

  it('setUser → syncWidgetData 呼出', async () => {
    await useUserStore.getState().setUser(TEST_USER);
    expect(mockSyncWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({
        streakStartDate: '2025-01-01',
        goalDays: 30,
      })
    );
  });

  it('updateUser → syncWidgetData に更新値が渡る', async () => {
    useUserStore.setState({ user: TEST_USER });
    await useUserStore.getState().updateUser({ goalDays: 90 });
    expect(mockSyncWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ goalDays: 90 })
    );
  });

  it('loadUser (user あり) → syncWidgetData 呼出', async () => {
    mockGet.mockResolvedValueOnce(TEST_USER);
    await useUserStore.getState().loadUser();
    expect(mockSyncWidgetData).toHaveBeenCalled();
  });

  it('loadUser (user=null) → syncWidgetData 未呼出', async () => {
    mockGet.mockResolvedValueOnce(null);
    await useUserStore.getState().loadUser();
    expect(mockSyncWidgetData).not.toHaveBeenCalled();
  });

  it('reset → clearWidgetData 呼出', async () => {
    useUserStore.setState({ user: TEST_USER });
    await useUserStore.getState().reset();
    expect(mockClearWidgetData).toHaveBeenCalled();
  });
});
