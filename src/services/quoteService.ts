import { appStore } from '../lib/store';
import { supabaseSyncService } from './supabaseSyncService';
import { Quote } from '../types';

export const quoteService = {
  getByRequestId(requestId: string): Quote[] {
    return appStore.getQuotes().filter(q => q.service_request_id === requestId);
  },

  create(data: {
    service_request_id: string;
    professional_id: string;
    amount: number;
    description: string;
    estimated_duration: string;
    available_date?: string;
    available_time?: string;
  }): Quote {
    const newQuote = appStore.createQuote({
      service_request_id: data.service_request_id,
      professional_id: data.professional_id,
      amount: data.amount,
      description: data.description,
      estimated_duration: data.estimated_duration,
      available_date: data.available_date || new Date().toISOString().split('T')[0],
      available_time: data.available_time || '10:00',
      status: 'pending',
    });

    supabaseSyncService.syncQuote(newQuote).catch(err => {
      console.warn('Falha na sincronização do orçamento com Supabase:', err);
    });

    return newQuote;
  },

  accept(quoteId: string, requestId: string) {
    appStore.acceptQuote(quoteId, requestId);

    const quote = appStore.getQuotes().find(q => q.id === quoteId);
    if (quote) {
      supabaseSyncService.syncQuote(quote);
    }
    const req = appStore.getRequestById(requestId);
    if (req) {
      supabaseSyncService.syncServiceRequest(req);
    }
  },
};
