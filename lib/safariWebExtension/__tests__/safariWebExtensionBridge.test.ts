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
    it('ネイティブが isEnabled: true を返した場合そのまま返す', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: true,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 1700000000,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(true);
      expect(status.extensionBundleId).toBe('rewire.app.com.SafariWebExtension');
    });

    it('ネイティブが isEnabled: false を返した場合そのまま返す', async () => {
      mockGetExtensionStatus.mockResolvedValue({
        isEnabled: false,
        extensionBundleId: 'rewire.app.com.SafariWebExtension',
        lastActiveAt: 0,
      });

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(false);
    });

    it('エラー時は isEnabled: false で安全にフォールバックする', async () => {
      mockGetExtensionStatus.mockRejectedValue(new Error('bridge failed'));

      const status = await safariWebExtensionBridge.getExtensionStatus();

      expect(status.isEnabled).toBe(false);
      expect(status.error).toBeDefined();
    });
  });
});
