import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'safariExtension.setupCompletedAt';

export async function getSetupCompletedAt(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function setSetupCompletedAt(seconds: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(seconds));
  } catch {
    // best-effort; grace period is not critical to functionality
  }
}
