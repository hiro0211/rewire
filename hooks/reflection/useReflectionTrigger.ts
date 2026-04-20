import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useReflectionSheet } from './useReflectionSheet';

const REFLECTION_ACTION = 'open_reflection';

function isReflectionResponse(response: Notifications.NotificationResponse | null): boolean {
  if (!response) return false;
  const data = response.notification.request.content.data;
  return data?.action === REFLECTION_ACTION;
}

export function useReflectionTrigger() {
  useEffect(() => {
    let cancelled = false;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!cancelled && isReflectionResponse(response)) {
        useReflectionSheet.getState().open();
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (isReflectionResponse(response)) {
          useReflectionSheet.getState().open();
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
}
