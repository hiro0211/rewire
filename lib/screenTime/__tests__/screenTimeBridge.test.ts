const mockRequestAuthorization = jest.fn();
const mockGetAuthorizationStatus = jest.fn();
const mockBlockSelection = jest.fn();
const mockUnblockSelection = jest.fn();
const mockIsShieldActive = jest.fn();
const mockSetFamilyActivitySelectionId = jest.fn();
const mockGetFamilyActivitySelectionId = jest.fn();
const mockSetWebContentFilterPolicy = jest.fn();
const mockClearWebContentFilterPolicy = jest.fn();
const mockUpdateShield = jest.fn();

jest.mock('react-native-device-activity', () => ({
  requestAuthorization: (...args: unknown[]) => mockRequestAuthorization(...args),
  getAuthorizationStatus: (...args: unknown[]) => mockGetAuthorizationStatus(...args),
  blockSelection: (...args: unknown[]) => mockBlockSelection(...args),
  unblockSelection: (...args: unknown[]) => mockUnblockSelection(...args),
  isShieldActive: (...args: unknown[]) => mockIsShieldActive(...args),
  setFamilyActivitySelectionId: (...args: unknown[]) =>
    mockSetFamilyActivitySelectionId(...args),
  getFamilyActivitySelectionId: (...args: unknown[]) =>
    mockGetFamilyActivitySelectionId(...args),
  setWebContentFilterPolicy: (...args: unknown[]) =>
    mockSetWebContentFilterPolicy(...args),
  clearWebContentFilterPolicy: (...args: unknown[]) =>
    mockClearWebContentFilterPolicy(...args),
  updateShield: (...args: unknown[]) => mockUpdateShield(...args),
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
import { BROWSER_SELECTION_ID } from '@/constants/screenTime/screenTimeConfig';

describe('screenTimeBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestAuthorization', () => {
    it('individualとしてrequestAuthorizationを呼びapprovedを返す', async () => {
      mockRequestAuthorization.mockResolvedValue(undefined);
      mockGetAuthorizationStatus.mockReturnValue(2);

      const result = await screenTimeBridge.requestAuthorization();

      expect(mockRequestAuthorization).toHaveBeenCalledWith('individual');
      expect(result.status).toBe('approved');
    });

    it('deniedの場合deniedを返す', async () => {
      mockRequestAuthorization.mockResolvedValue(undefined);
      mockGetAuthorizationStatus.mockReturnValue(1);

      const result = await screenTimeBridge.requestAuthorization();

      expect(result.status).toBe('denied');
    });

    it('例外時はdenied+messageを返す', async () => {
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

  describe('persistSelection', () => {
    it('BROWSER_SELECTION_IDでsetFamilyActivitySelectionIdを呼ぶ', () => {
      const token = 'abc-token-base64';
      const ok = screenTimeBridge.persistSelection(token);

      expect(ok).toBe(true);
      expect(mockSetFamilyActivitySelectionId).toHaveBeenCalledWith({
        id: BROWSER_SELECTION_ID,
        familyActivitySelection: token,
      });
    });

    it('例外時はfalseを返す', () => {
      mockSetFamilyActivitySelectionId.mockImplementationOnce(() => {
        throw new Error('boom');
      });

      const ok = screenTimeBridge.persistSelection('token');

      expect(ok).toBe(false);
    });
  });

  describe('getStoredSelection', () => {
    it('保存されたトークンを返す', () => {
      mockGetFamilyActivitySelectionId.mockReturnValue('saved-token');

      expect(screenTimeBridge.getStoredSelection()).toBe('saved-token');
      expect(mockGetFamilyActivitySelectionId).toHaveBeenCalledWith(
        BROWSER_SELECTION_ID,
      );
    });

    it('未設定ならnullを返す', () => {
      mockGetFamilyActivitySelectionId.mockReturnValue(undefined);

      expect(screenTimeBridge.getStoredSelection()).toBeNull();
    });
  });

  describe('applyAppShield', () => {
    const t = (k: string) => k;

    it('updateShield + setWebContentFilterPolicy(auto) + blockSelection(BROWSER_SELECTION_ID)を呼ぶ', () => {
      const ok = screenTimeBridge.applyAppShield(t);

      expect(ok).toBe(true);
      expect(mockUpdateShield).toHaveBeenCalledTimes(1);
      expect(mockSetWebContentFilterPolicy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto' }),
      );
      expect(mockBlockSelection).toHaveBeenCalledWith({
        activitySelectionId: BROWSER_SELECTION_ID,
      });
    });

    it('hasSelection=falseの時はblockSelectionをスキップしWebContentFilterだけ適用', () => {
      const ok = screenTimeBridge.applyAppShield(t, false);

      expect(ok).toBe(true);
      expect(mockSetWebContentFilterPolicy).toHaveBeenCalled();
      expect(mockBlockSelection).not.toHaveBeenCalled();
    });

    it('例外時はfalseを返す', () => {
      mockBlockSelection.mockImplementationOnce(() => {
        throw new Error('shield failed');
      });

      const ok = screenTimeBridge.applyAppShield(t);

      expect(ok).toBe(false);
    });
  });

  describe('clearAppShield', () => {
    it('clearWebContentFilterPolicy + unblockSelection(BROWSER_SELECTION_ID)を呼ぶ', () => {
      const ok = screenTimeBridge.clearAppShield();

      expect(ok).toBe(true);
      expect(mockClearWebContentFilterPolicy).toHaveBeenCalled();
      expect(mockUnblockSelection).toHaveBeenCalledWith({
        activitySelectionId: BROWSER_SELECTION_ID,
      });
    });

    it('hasSelection=falseの時はunblockSelectionをスキップしWebContentFilterだけ解除', () => {
      const ok = screenTimeBridge.clearAppShield(false);

      expect(ok).toBe(true);
      expect(mockClearWebContentFilterPolicy).toHaveBeenCalled();
      expect(mockUnblockSelection).not.toHaveBeenCalled();
    });

    it('例外時はfalseを返す', () => {
      mockUnblockSelection.mockImplementationOnce(() => {
        throw new Error('clear failed');
      });

      const ok = screenTimeBridge.clearAppShield();

      expect(ok).toBe(false);
    });
  });

  describe('isShieldActive', () => {
    it('libのisShieldActiveをそのまま返す', () => {
      mockIsShieldActive.mockReturnValue(true);
      expect(screenTimeBridge.isShieldActive()).toBe(true);
    });

    it('例外時はfalseを返す', () => {
      mockIsShieldActive.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      expect(screenTimeBridge.isShieldActive()).toBe(false);
    });
  });
});
