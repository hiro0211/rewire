jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn((n: number) => {
    // Return deterministic bytes for testing
    const arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) arr[i] = i % 256;
    return arr;
  }),
}));

import { encryptionService } from '../encryptionService';

describe('encryptionService', () => {
  describe('encrypt + decrypt roundtrip', () => {
    it('暗号化と復号のラウンドトリップが正しい', async () => {
      const plaintext = JSON.stringify([{ id: '1', data: 'テスト' }]);
      const encrypted = await encryptionService.encrypt(plaintext);
      // Should be either PLAIN: prefixed or base64 encoded
      expect(encrypted).toBeTruthy();
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = await encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('空文字列の暗号化・復号', async () => {
      const encrypted = await encryptionService.encrypt('');
      const decrypted = await encryptionService.decrypt(encrypted);
      expect(decrypted).toBe('');
    });
  });

  describe('decrypt', () => {
    it('PLAIN:プレフィックスを除去して返す', async () => {
      const result = await encryptionService.decrypt('PLAIN:hello');
      expect(result).toBe('hello');
    });
  });

  describe('isEncrypted', () => {
    it('JSON配列文字列はfalse', () => {
      expect(encryptionService.isEncrypted('[{"id":"1"}]')).toBe(false);
    });

    it('JSONオブジェクト文字列はfalse', () => {
      expect(encryptionService.isEncrypted('{"name":"test"}')).toBe(false);
    });

    it('PLAIN:プレフィックスはfalse', () => {
      expect(encryptionService.isEncrypted('PLAIN:data')).toBe(false);
    });

    it('空文字列はfalse', () => {
      expect(encryptionService.isEncrypted('')).toBe(false);
    });

    it('短い文字列はfalse', () => {
      expect(encryptionService.isEncrypted('short')).toBe(false);
    });

    it('有効なbase64文字列（28文字以上）はtrue', () => {
      const base64 = btoa('abcdefghijklmnopqrstu');
      expect(base64.length).toBeGreaterThanOrEqual(28);
      expect(encryptionService.isEncrypted(base64)).toBe(true);
    });
  });
});
