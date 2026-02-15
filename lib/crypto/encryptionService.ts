import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_ALIAS = 'rewire_enc_key';

// Check if crypto.subtle is available
const isCryptoAvailable = typeof globalThis.crypto !== 'undefined' && 
                         typeof globalThis.crypto.subtle !== 'undefined';

async function getOrCreateKey(): Promise<CryptoKey | null> {
  if (!isCryptoAvailable) {
    console.warn('[encryptionService] crypto.subtle not available, encryption disabled');
    return null;
  }

  let rawKeyBase64 = await SecureStore.getItemAsync(KEY_ALIAS);

  if (!rawKeyBase64) {
    const rawKey = Crypto.getRandomBytes(32);
    rawKeyBase64 = uint8ArrayToBase64(rawKey);
    await SecureStore.setItemAsync(KEY_ALIAS, rawKeyBase64);
  }

  const keyData = base64ToUint8Array(rawKeyBase64);
  return globalThis.crypto.subtle.importKey('raw', keyData.buffer as ArrayBuffer, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const encryptionService = {
  async encrypt(plaintext: string): Promise<string> {
    // Fallback: If crypto is not available, return plaintext with a prefix
    if (!isCryptoAvailable) {
      return `PLAIN:${plaintext}`;
    }

    const key = await getOrCreateKey();
    if (!key) {
      return `PLAIN:${plaintext}`;
    }

    const iv = Crypto.getRandomBytes(12);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const ciphertext = await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      data.buffer as ArrayBuffer
    );

    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(new Uint8Array(iv), 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return uint8ArrayToBase64(combined);
  },

  async decrypt(encryptedBase64: string): Promise<string> {
    // Handle plaintext fallback
    if (encryptedBase64.startsWith('PLAIN:')) {
      return encryptedBase64.substring(6);
    }

    if (!isCryptoAvailable) {
      throw new Error('Crypto not available and data is encrypted');
    }

    const key = await getOrCreateKey();
    if (!key) {
      throw new Error('Could not get encryption key');
    }

    const combined = base64ToUint8Array(encryptedBase64);

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ciphertext.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  },

  isEncrypted(value: string): boolean {
    // Check for plaintext fallback prefix
    if (value.startsWith('PLAIN:')) {
      return false;
    }

    // Unencrypted JSON starts with [ or {. Encrypted data is base64.
    if (!value || value.length < 28) return false;
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) return false;
    try {
      atob(trimmed);
      return true;
    } catch {
      return false;
    }
  },
};
