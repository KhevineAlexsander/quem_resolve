import { appStore } from '../lib/store';
import { Notification } from '../types';

export const notificationService = {
  getNotifications(userId?: string): Notification[] {
    return appStore.getNotifications(userId);
  },

  markRead(id: string) {
    appStore.markNotificationRead(id);
  },

  getUnreadCount(userId?: string): number {
    return appStore.getNotifications(userId).filter(n => !n.read_at).length;
  },
};
