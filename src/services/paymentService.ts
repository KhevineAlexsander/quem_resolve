import { appStore } from '../lib/store';
import { Payment } from '../types';

export const paymentService = {
  getPayments(): Payment[] {
    return appStore.getPayments();
  },

  getFeePercentage(): number {
    return appStore.getPlatformFeePercentage();
  },

  setFeePercentage(fee: number) {
    appStore.setPlatformFeePercentage(fee);
  },

  processPayment(requestId: string, amount: number, proId: string, clientId: string): Payment {
    return appStore.processPayment(requestId, amount, proId, clientId);
  },
};
