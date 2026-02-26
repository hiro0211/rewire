jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockEncrypt = jest.fn((text: string) => Promise.resolve(`PLAIN:${text}`));
const mockDecrypt = jest.fn((text: string) =>
  Promise.resolve(text.startsWith('PLAIN:') ? text.substring(6) : text),
);
const mockIsEncrypted = jest.fn(() => false);

jest.mock('@/lib/crypto/encryptionService', () => ({
  encryptionService: {
    encrypt: (...args: any[]) => mockEncrypt(...args),
    decrypt: (...args: any[]) => mockDecrypt(...args),
    isEncrypted: (...args: any[]) => mockIsEncrypted(...args),
  },
}));

import { asyncStorageClient } from '../asyncStorageClient';

describe('asyncStorageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock)();
  });

  describe('get', () => {
    it('非センシティブキーの場合はJSON.parseして返す', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ name: 'test' }));

      const result = await asyncStorageClient.get('user');
      expect(result).toEqual({ name: 'test' });
      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it('キーが存在しない場合はnullを返す', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await asyncStorageClient.get('user');
      expect(result).toBeNull();
    });

    it('JSONパースエラーの場合はnullを返す', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await asyncStorageClient.get('user');
      expect(result).toBeNull();
    });

    it('センシティブキーでPLAIN:プレフィックスの場合はプレフィックスを除去してパース', async () => {
      const data = [{ id: '1' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(`PLAIN:${JSON.stringify(data)}`);

      const result = await asyncStorageClient.get('checkins');
      expect(result).toEqual(data);
    });

    it('センシティブキーで暗号化データの場合は復号してパース', async () => {
      const data = [{ id: '1' }];
      mockIsEncrypted.mockReturnValue(true);
      mockDecrypt.mockResolvedValue(JSON.stringify(data));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('encryptedBase64Data==');

      const result = await asyncStorageClient.get('checkins');
      expect(mockDecrypt).toHaveBeenCalledWith('encryptedBase64Data==');
      expect(result).toEqual(data);
    });

    it('センシティブキーで未暗号化データの場合はマイグレーション（そのままパース）', async () => {
      const data = [{ id: '1' }];
      mockIsEncrypted.mockReturnValue(false);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(data));

      const result = await asyncStorageClient.get('checkins');
      expect(result).toEqual(data);
    });
  });

  describe('set', () => {
    it('非センシティブキーの場合はJSON.stringifyして保存', async () => {
      await asyncStorageClient.set('user', { name: 'test' });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ name: 'test' }));
      expect(mockEncrypt).not.toHaveBeenCalled();
    });

    it('センシティブキーの場合は暗号化して保存', async () => {
      const data = [{ id: '1' }];
      mockEncrypt.mockResolvedValue('PLAIN:' + JSON.stringify(data));

      await asyncStorageClient.set('checkins', data);
      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(data));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('checkins', 'PLAIN:' + JSON.stringify(data));
    });

    it('保存エラー時はthrowする', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Write failed'));
      await expect(asyncStorageClient.set('user', {})).rejects.toThrow('Write failed');
    });
  });

  describe('remove', () => {
    it('キーを削除する', async () => {
      await asyncStorageClient.remove('user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('削除エラー時はthrowする', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove failed'));
      await expect(asyncStorageClient.remove('user')).rejects.toThrow('Remove failed');
    });
  });

  describe('clearAll', () => {
    it('全データを削除する', async () => {
      await asyncStorageClient.clearAll();
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('クリアエラー時はthrowする', async () => {
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(new Error('Clear failed'));
      await expect(asyncStorageClient.clearAll()).rejects.toThrow('Clear failed');
    });
  });
});
