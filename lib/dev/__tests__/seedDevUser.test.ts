const mockSetUser = jest.fn();
const mockGetState = jest.fn();

jest.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: () => mockGetState(),
  },
}));

import { seedDevUser } from '../seedDevUser';

describe('seedDevUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({ user: null, setUser: mockSetUser });
  });

  it('userがnullのときダミーユーザーをsetUserに渡す', async () => {
    await seedDevUser();
    expect(mockSetUser).toHaveBeenCalledTimes(1);
    const arg = mockSetUser.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        id: 'dev-user',
        nickname: expect.any(String),
        goalDays: expect.any(Number),
        isPro: true,
        notifyTime: expect.any(String),
        notifyEnabled: expect.any(Boolean),
        consentGivenAt: expect.any(String),
        ageVerifiedAt: expect.any(String),
        createdAt: expect.any(String),
        streakStartDate: expect.any(String),
        hasCompletedPostPurchaseOnboarding: true,
      }),
    );
  });

  it('既にuserが存在するときは何もしない', async () => {
    mockGetState.mockReturnValue({
      user: { id: 'existing' },
      setUser: mockSetUser,
    });
    await seedDevUser();
    expect(mockSetUser).not.toHaveBeenCalled();
  });
});
