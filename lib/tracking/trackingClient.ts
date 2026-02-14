import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync, isAvailable } from 'expo-tracking-transparency';
import { Platform } from 'react-native';

export const trackingClient = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') return true;
    if (!isAvailable()) return false;

    const { status: existingStatus } = await getTrackingPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestTrackingPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async getPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') return true;
    if (!isAvailable()) return false;

    const { status } = await getTrackingPermissionsAsync();
    return status === 'granted';
  },
};
