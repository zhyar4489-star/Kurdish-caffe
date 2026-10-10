// Push and In-App Notifications Manager

export interface InAppNotification {
  id: string;
  type: 'message' | 'friend_request' | 'friend_accepted' | 'coin_gift' | 'call';
  title: string;
  body: string;
  avatar?: string;
  timestamp: number;
  onClick?: () => void;
}

type NotificationListener = (notification: InAppNotification) => void;
const listeners: Set<NotificationListener> = new Set();

export function subscribeToNotifications(listener: NotificationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchInAppNotification(notification: InAppNotification) {
  listeners.forEach((listener) => listener(notification));

  // Also trigger native browser notification if granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.avatar || '/favicon.ico',
      });
    } catch {
      // In some sandboxed iframes native notification may fail silently
    }
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Failed to request notification permission:', e);
    return 'denied';
  }
}
