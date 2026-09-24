import { appStore } from '../lib/store';
import { supabaseSyncService } from './supabaseSyncService';
import { Message } from '../types';

export const messageService = {
  getMessages(conversationId?: string): Message[] {
    return appStore.getMessages(conversationId);
  },

  sendMessage(conversationId: string, senderId: string, message: string): Message {
    const newMsg = appStore.sendMessage(conversationId, senderId, message);

    supabaseSyncService.syncMessage(newMsg).catch(err => {
      console.warn('Falha na sincronização da mensagem com Supabase:', err);
    });

    return newMsg;
  },

  markRead(conversationId: string, currentUserId: string) {
    appStore.markMessagesRead(conversationId, currentUserId);
  },
};
