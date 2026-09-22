import { appStore } from '../lib/store';
import { ServiceTracking } from '../types';

export const trackingService = {
  getTracking(requestId: string): ServiceTracking | undefined {
    return appStore.getTracking(requestId);
  },

  updatePosition(requestId: string, lat: number, lon: number, etaMinutes?: number) {
    appStore.updateTracking(requestId, {
      latitude: lat,
      longitude: lon,
      eta_minutes: etaMinutes,
    });
  },
};
