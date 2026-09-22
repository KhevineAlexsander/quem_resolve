import { appStore } from '../lib/store';
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
    return appStore.createReview(data);
  },
};
