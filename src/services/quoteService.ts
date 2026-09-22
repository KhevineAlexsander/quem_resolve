import { appStore } from '../lib/store';
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
    return appStore.createQuote({
      service_request_id: data.service_request_id,
      professional_id: data.professional_id,
      amount: data.amount,
      description: data.description,
      estimated_duration: data.estimated_duration,
      available_date: data.available_date || new Date().toISOString().split('T')[0],
      available_time: data.available_time || '10:00',
      status: 'pending',
    });
  },

  accept(quoteId: string, requestId: string) {
    appStore.acceptQuote(quoteId, requestId);
  },
};
