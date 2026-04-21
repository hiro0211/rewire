const mockGetBlockerStatus = jest.fn();
const mockReloadBlockerRules = jest.fn();
const mockEnableBlocker = jest.fn();
const mockDisableBlocker = jest.fn();

jest.mock('../../../modules/expo-content-blocker/src', () => ({
  default: {
    enableBlocker: mockEnableBlocker,
    disableBlocker: mockDisableBlocker,
    getBlockerStatus: mockGetBlockerStatus,
    reloadBlockerRules: mockReloadBlockerRules,
  },
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Platform.OS = 'ios';
  return rn;
});

import { contentBlockerBridge } from '../contentBlockerBridge';

describe('contentBlockerBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBlockerStatus', () => {
    it('Safari拡張機能がON (isEnabled: true) のとき「有効」相当の値を返す', async () => {
      mockGetBlockerStatus.mockResolvedValue({
        isEnabled: true,
        extensionBundleId: 'rewire.app.com.ContentBlockerExtension',
      });

      const status = await contentBlockerBridge.getBlockerStatus();

      expect(status.isEnabled).toBe(true);
    });

    it('Safari拡張機能がOFF (isEnabled: false) のとき false を返す', async () => {
      mockGetBlockerStatus.mockResolvedValue({
        isEnabled: false,
        extensionBundleId: 'rewire.app.com.ContentBlockerExtension',
      });

      const status = await contentBlockerBridge.getBlockerStatus();

      expect(status.isEnabled).toBe(false);
    });

    it('ネイティブモジュールがエラーを投げた場合は isEnabled: false で安全にフォールバックする', async () => {
      mockGetBlockerStatus.mockRejectedValue(new Error('Native module error'));

      const status = await contentBlockerBridge.getBlockerStatus();

      expect(status.isEnabled).toBe(false);
    });

    it('getBlockerStatus はネイティブモジュールを1回だけ呼ぶ', async () => {
      mockGetBlockerStatus.mockResolvedValue({ isEnabled: true, extensionBundleId: '' });

      await contentBlockerBridge.getBlockerStatus();

      expect(mockGetBlockerStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('reloadBlockerRules', () => {
    it('ルールのリロードが成功したとき true を返す', async () => {
      mockReloadBlockerRules.mockResolvedValue(true);

      const result = await contentBlockerBridge.reloadBlockerRules();

      expect(result).toBe(true);
    });

    it('ルールのリロードが失敗したとき false を返す', async () => {
      mockReloadBlockerRules.mockRejectedValue(new Error('reload failed'));

      const result = await contentBlockerBridge.reloadBlockerRules();

      expect(result).toBe(false);
    });
  });

  describe('enableBlocker / disableBlocker', () => {
    it('enableBlocker 成功時 true を返す', async () => {
      mockEnableBlocker.mockResolvedValue(true);

      const result = await contentBlockerBridge.enableBlocker();

      expect(result).toBe(true);
    });

    it('disableBlocker は常に false を返す（iOS仕様）', async () => {
      mockDisableBlocker.mockResolvedValue(false);

      const result = await contentBlockerBridge.disableBlocker();

      expect(result).toBe(false);
    });
  });
});
