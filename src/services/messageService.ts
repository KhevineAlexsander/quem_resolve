import { appStore } from '../lib/store';
import { Message } from '../types';

export const messageService = {
  getMessages(conversationId?: string): Message[] {
    return appStore.getMessages(conversationId);
  },

  sendMessage(conversationId: string, senderId: string, message: string): Message {
    return appStore.sendMessage(conversationId, senderId, message);
  },

  markRead(conversationId: string, currentUserId: string) {
    appStore.markMessagesRead(conversationId, currentUserId);
  },
};
