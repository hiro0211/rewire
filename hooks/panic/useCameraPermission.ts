import { useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';

/**
 * Wraps expo-camera's useCameraPermissions with a clearer shape for the panic
 * screen UI. The panic screen should not block the rest of the app if the user
 * denies the camera prompt, so this hook exposes a simple flag plus a loading
 * state that consumers can render fallback UI against.
 */
interface UseCameraPermissionReturn {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useCameraPermission(): UseCameraPermissionReturn {
  const [permission, requestPermissionAsync] = useCameraPermissions();

  const isLoading = permission === null;
  const hasPermission = permission?.granted === true;

  const requestPermission = useCallback(async () => {
    const result = await requestPermissionAsync();
    return result?.granted === true;
  }, [requestPermissionAsync]);

  return { hasPermission, isLoading, requestPermission };
}
