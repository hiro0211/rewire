const mockRequestAuthorization = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockSetWebContentFilterPolicy = jest.fn();
const mockClearWebContentFilterPolicy = jest.fn();
const mockUpdateShieldWithId = jest.fn();

jest.mock('react-native-device-activity', () => ({
  requestAuthorization: (...args: unknown[]) => mockRequestAuthorization(...args),
  getAuthorizationStatus: (...args: unknown[]) => mockGetAuthorizationStatus(...args),
  setWebContentFilterPolicy: (...args: unknown[]) => mockSetWebContentFilterPolicy(...args),
  clearWebContentFilterPolicy: (...args: unknown[]) => mockClearWebContentFilterPolicy(...args),
  updateShieldWithId: (...args: unknown[]) => mockUpdateShieldWithId(...args),
  AuthorizationStatus: { notDetermined: 0, denied: 1, approved: 2 },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('@/lib/screenTime/shieldConfig', () => ({
  buildRewireShieldConfig: jest.fn(() => ({ title: 'Rewire' })),
  buildShieldActions: jest.fn(() => ({ primary: { behavior: 'defer' } })),
}));

import { screenTimeBridge } from '../screenTimeBridge';
import { PRIORITY_BLOCKED_DOMAINS } from '@/constants/screenTime/blockedDomains';
import { SHIELD_ID } from '@/constants/screenTime/screenTimeConfig';

const identityT = (k: string) => k;

describe('screenTimeBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestAuthorization', () => {
    it('individualとしてlibraryのrequestAuthorizationを呼ぶ', async () => {
      mockRequestAuthorization.mockResolvedValue(undefined);
      mockGetAuthorizationStatus.mockReturnValue(2);

      const result = await screenTimeBridge.requestAuthorization();

      expect(mockRequestAuthorization).toHaveBeenCalledWith('individual');
      expect(result.status).toBe('approved');
    });

    it('deniedの場合deniedステータスを返す', async () => {
      mockRequestAuthorization.mockResolvedValue(undefined);
      mockGetAuthorizationStatus.mockReturnValue(1);

      const result = await screenTimeBridge.requestAuthorization();

      expect(result.status).toBe('denied');
    });

    it('例外が起きた場合deniedで返す', async () => {
      mockRequestAuthorization.mockRejectedValue(new Error('User denied'));

      const result = await screenTimeBridge.requestAuthorization();

      expect(result.status).toBe('denied');
      expect(result.error).toBe('User denied');
    });
  });

  describe('getAuthorizationStatus', () => {
    it('approvedを返す', () => {
      mockGetAuthorizationStatus.mockReturnValue(2);
      expect(screenTimeBridge.getAuthorizationStatus()).toBe('approved');
    });

    it('deniedを返す', () => {
      mockGetAuthorizationStatus.mockReturnValue(1);
      expect(screenTimeBridge.getAuthorizationStatus()).toBe('denied');
    });

    it('notDeterminedを返す', () => {
      mockGetAuthorizationStatus.mockReturnValue(0);
      expect(screenTimeBridge.getAuthorizationStatus()).toBe('notDetermined');
    });
  });

  describe('enableAdultSiteBlocking', () => {
    it('setWebContentFilterPolicyをauto+PRIORITYドメインで呼ぶ', async () => {
      await screenTimeBridge.enableAdultSiteBlocking(identityT);

      expect(mockSetWebContentFilterPolicy).toHaveBeenCalledWith({
        type: 'auto',
        domains: PRIORITY_BLOCKED_DOMAINS,
      });
    });

    it('updateShieldWithIdでShield設定とSHIELD_IDを登録する', async () => {
      await screenTimeBridge.enableAdultSiteBlocking(identityT);

      expect(mockUpdateShieldWithId).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        SHIELD_ID,
      );
    });

    it('成功時trueを返す', async () => {
      expect(await screenTimeBridge.enableAdultSiteBlocking(identityT)).toBe(true);
    });

    it('例外時falseを返す', async () => {
      mockSetWebContentFilterPolicy.mockImplementationOnce(() => {
        throw new Error('failed');
      });
      expect(await screenTimeBridge.enableAdultSiteBlocking(identityT)).toBe(false);
    });
  });

  describe('disableAdultSiteBlocking', () => {
    it('clearWebContentFilterPolicyを呼ぶ', async () => {
      expect(await screenTimeBridge.disableAdultSiteBlocking()).toBe(true);
      expect(mockClearWebContentFilterPolicy).toHaveBeenCalled();
    });

    it('例外時falseを返す', async () => {
      mockClearWebContentFilterPolicy.mockImplementationOnce(() => {
        throw new Error('failed');
      });
      expect(await screenTimeBridge.disableAdultSiteBlocking()).toBe(false);
    });
  });
});

