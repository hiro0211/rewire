const mockSetDenyAppRemoval = jest.fn();
const mockGetDenyAppRemoval = jest.fn();

jest.mock('@/modules/expo-app-removal-guard/src', () => ({
  __esModule: true,
  default: {
    setDenyAppRemoval: (...args: unknown[]) => mockSetDenyAppRemoval(...args),
    getDenyAppRemoval: (...args: unknown[]) => mockGetDenyAppRemoval(...args),
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { appRemovalBridge } from '../appRemovalBridge';

describe('appRemovalBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lock: setDenyAppRemoval(true) を呼ぶ', async () => {
    mockSetDenyAppRemoval.mockResolvedValue(true);

    const ok = await appRemovalBridge.lock();

    expect(ok).toBe(true);
    expect(mockSetDenyAppRemoval).toHaveBeenCalledWith(true);
  });

  it('unlock: setDenyAppRemoval(false) を呼ぶ', async () => {
    mockSetDenyAppRemoval.mockResolvedValue(true);

    const ok = await appRemovalBridge.unlock();

    expect(ok).toBe(true);
    expect(mockSetDenyAppRemoval).toHaveBeenCalledWith(false);
  });

  it('isLocked: 現在値を返す', async () => {
    mockGetDenyAppRemoval.mockResolvedValue(true);

    const v = await appRemovalBridge.isLocked();

    expect(v).toBe(true);
  });

  it('lock例外時はfalseを返す', async () => {
    mockSetDenyAppRemoval.mockRejectedValueOnce(new Error('boom'));

    const ok = await appRemovalBridge.lock();

    expect(ok).toBe(false);
  });

  it('isLocked例外時はfalseを返す', async () => {
    mockGetDenyAppRemoval.mockRejectedValueOnce(new Error('boom'));

    const v = await appRemovalBridge.isLocked();

    expect(v).toBe(false);
  });
});
