const mockRequestAuthorization = jest.fn();
const mockSetWebContentFilterPolicy = jest.fn();
const mockClearWebContentFilterPolicy = jest.fn();

jest.mock('react-native-device-activity', () => ({
  requestAuthorization: (...args: unknown[]) => mockRequestAuthorization(...args),
  getAuthorizationStatus: jest.fn(),
  setWebContentFilterPolicy: (...args: unknown[]) => mockSetWebContentFilterPolicy(...args),
  clearWebContentFilterPolicy: (...args: unknown[]) => mockClearWebContentFilterPolicy(...args),
  updateShieldWithId: jest.fn(),
  AuthorizationStatus: { notDetermined: 0, denied: 1, approved: 2 },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('@/lib/screenTime/shieldConfig', () => ({
  buildRewireShieldConfig: jest.fn(),
  buildShieldActions: jest.fn(),
}));

import { screenTimeBridge } from '../screenTimeBridge';

const identityT = (k: string) => k;

describe('screenTimeBridge on Android', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requestAuthorizationはlibraryを呼ばずnotDeterminedを返す', async () => {
    const result = await screenTimeBridge.requestAuthorization();
    expect(mockRequestAuthorization).not.toHaveBeenCalled();
    expect(result.status).toBe('notDetermined');
  });

  it('getAuthorizationStatusはnotDeterminedを返す', () => {
    expect(screenTimeBridge.getAuthorizationStatus()).toBe('notDetermined');
  });

  it('enableAdultSiteBlockingはfalseを返し、ライブラリを呼ばない', async () => {
    expect(await screenTimeBridge.enableAdultSiteBlocking(identityT)).toBe(false);
    expect(mockSetWebContentFilterPolicy).not.toHaveBeenCalled();
  });

  it('disableAdultSiteBlockingはfalseを返し、ライブラリを呼ばない', async () => {
    expect(await screenTimeBridge.disableAdultSiteBlocking()).toBe(false);
    expect(mockClearWebContentFilterPolicy).not.toHaveBeenCalled();
  });
});
