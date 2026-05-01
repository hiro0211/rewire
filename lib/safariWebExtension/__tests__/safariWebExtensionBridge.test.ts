const mockGetExtensionStatus = jest.fn();

jest.mock('../../../modules/expo-safari-web-extension/src', () => ({
  default: {
    getExtensionStatus: mockGetExtensionStatus,
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
});
