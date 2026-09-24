import { appStore } from '../lib/store';
import { supabaseSyncService } from './supabaseSyncService';
import { Review } from '../types';

export const reviewService = {
  getByProfessionalId(proId: string): Review[] {
    return appStore.getReviews(proId);
  },

  create(data: {
    service_request_id: string;
    client_id: string;
    professional_id: string;
    rating: number;
    comment: string;
  }): Review {
    const newRev = appStore.createReview(data);

    supabaseSyncService.syncReview(newRev).catch(err => {
      console.warn('Falha na sincronização da avaliação com Supabase:', err);
    });

    return newRev;
  },
};
