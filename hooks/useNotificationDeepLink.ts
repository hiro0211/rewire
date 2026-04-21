import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { PANIC_NOTIFICATION_IDENTIFIER, PANIC_ROUTE } from '@/constants/screenTime/screenTimeConfig';

function handleResponse(
  response: Notifications.NotificationResponse,
  push: (route: string) => void,
) {
  const route = response.notification.request.content.data?.route;
  if (typeof route === 'string') {
    push(route);
    return;
  }
  const categoryId = response.notification.request.content.categoryIdentifier;
  if (categoryId === PANIC_NOTIFICATION_IDENTIFIER) {
    push(PANIC_ROUTE);
  }
}

export function useNotificationDeepLink() {
  const router = useRouter();

  useEffect(() => {
    const push = (route: string) => router.push(route as never);

    // Handle cold start: check if app was opened via notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleResponse(response, push);
      }
    });

    // Handle warm start: listen for notification taps while app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleResponse(response, push);
      },
    );

    return () => subscription.remove();
  }, [router]);
}
