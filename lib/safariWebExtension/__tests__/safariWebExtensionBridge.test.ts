const mockGetExtensionStatus = jest.fn();
const mockGetExtensionState = jest.fn();
const mockAddListener = jest.fn();

jest.mock('../../../modules/expo-safari-web-extension/src', () => ({
  default: {
    getExtensionStatus: mockGetExtensionStatus,
    getExtensionState: mockGetExtensionState,
    addListener: mockAddListener,
  },
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.OS = 'ios';
  return rn;
});

import { safariWebExtensionBridge } from '../safariWebExtensionBridge';

describe('safariWebExtensionBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExtensionStatus', () => {
    it('ネイティブが isEnabled: true かつ hasAllUrls: true を返した場合そのまま返す', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: true,
        hasAllUrls: true,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 1700000000,
        lastBlockedAt: 1700000050,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(true);
      expect(status.hasAllUrls).toBe(true);
      expect(status.extensionBundleId).toBe('rewire.app.com.SafariWebExtension');
      expect(status.lastBlockedAt).toBe(1700000050);
    });

    it('ネイティブが lastBlockedAt を返さない場合は 0 にフォールバック', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: true,
        hasAllUrls: true,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 1700000000,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.lastBlockedAt).toBe(0);
    });

    it('ネイティブが isEnabled: true かつ hasAllUrls: false を返した場合そのまま返す', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: true,
        hasAllUrls: false,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 1700000000,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(true);
      expect(status.hasAllUrls).toBe(false);
    });

    it('ネイティブが isEnabled: false を返した場合そのまま返す', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: false,
        hasAllUrls: false,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 0,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(false);
      expect(status.hasAllUrls).toBe(false);
    });

    it('エラー時は isEnabled: false, hasAllUrls: false, lastBlockedAt: 0 で安全にフォールバックする', async () => {
      mockGetExtensionStatus.mockRejectedValue(new Error('bridge failed'));

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(false);
      expect(status.hasAllUrls).toBe(false);
      expect(status.lastBlockedAt).toBe(0);
      expect(status.error).toBeDefined();
    });
  });

  describe('getExtensionState (Tier 1: SFSafariExtensionManager iOS 26.2+)', () => {
    it('iOS 26.2+ で利用可能なら available: true と isEnabled をそのまま返す', async () => {
      mockGetExtensionState.mockResolvedValue({ available: true, isEnabled: true });

      const state = await safariWebExtensionBridge.getExtensionState();

      expect(state.available).toBe(true);
      expect(state.isEnabled).toBe(true);
    });

    it('iOS 26.2+ で利用可能だが拡張機能が無効のとき available: true, isEnabled: false', async () => {
      mockGetExtensionState.mockResolvedValue({ available: true, isEnabled: false });

      const state = await safariWebExtensionBridge.getExtensionState();

      expect(state.available).toBe(true);
      expect(state.isEnabled).toBe(false);
    });

    it('iOS 26.2 未満では available: false を返す', async () => {
      mockGetExtensionState.mockResolvedValue({ available: false, isEnabled: false });

      const state = await safariWebExtensionBridge.getExtensionState();

      expect(state.available).toBe(false);
      expect(state.isEnabled).toBe(false);
    });

    it('ネイティブエラー時は available: false でフォールバックし error を含む', async () => {
      mockGetExtensionState.mockRejectedValue(new Error('boom'));

      const state = await safariWebExtensionBridge.getExtensionState();

      expect(state.available).toBe(false);
      expect(state.isEnabled).toBe(false);
      expect(state.error).toBeDefined();
    });
  });

  describe('subscribeAlive (Tier 2: Darwin Notifications)', () => {
    it('リスナーを native の addListener へ登録し、unsubscribe 関数を返す', () => {
      const removeMock = jest.fn();
      mockAddListener.mockReturnValue({ remove: removeMock });
      const listener = jest.fn();

      const unsubscribe = safariWebExtensionBridge.subscribeAlive(listener);

      expect(mockAddListener).toHaveBeenCalledWith('onExtensionAlive', listener);
      unsubscribe();
      expect(removeMock).toHaveBeenCalled();
    });

    it('addListener が例外を投げても unsubscribe は no-op で呼べる', () => {
      mockAddListener.mockImplementation(() => {
        throw new Error('subscribe failed');
      });
      const listener = jest.fn();

      const unsubscribe = safariWebExtensionBridge.subscribeAlive(listener);

      expect(() => unsubscribe()).not.toThrow();
    });
  });
});
