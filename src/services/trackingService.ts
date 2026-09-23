import { appStore } from '../lib/store';
import { ServiceTracking, ServiceTrackingStatus } from '../types';

export const trackingService = {
  getTracking(requestId: string): ServiceTracking | undefined {
    const req = appStore.getRequestById(requestId);
    if (!req) return undefined;
    return {
      id: 'tracking-' + requestId,
      service_request_id: requestId,
      status: req.status,
      updated_at: req.updated_at,
    };
  },

  updatePosition(requestId: string, lat?: number, lon?: number, etaMinutes?: number) {
    // Geolocation is not required per user prompt specification (Section 14)
    // Legacy stub preserved for compatibility
  },

  updateStatus(requestId: string, status: ServiceTrackingStatus) {
    return appStore.updateRequestStatus(requestId, status);
  }
};

