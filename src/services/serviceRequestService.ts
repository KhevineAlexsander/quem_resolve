import { appStore } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ServiceRequest, ServiceRequestStatus } from '../types';

export const serviceRequestService = {
  getAll(): ServiceRequest[] {
    return appStore.getRequests();
  },

  getById(id: string): ServiceRequest | undefined {
    return appStore.getRequestById(id);
  },

  getByClientId(clientId: string): ServiceRequest[] {
    return appStore.getRequests().filter(r => r.client_id === clientId);
  },

  async create(data: {
    client_id: string;
    category_id: string;
    title: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    urgency: 'normal' | 'urgent';
    scheduled_date?: string;
    scheduled_start?: string;
    imageUrl?: string;
  }): Promise<ServiceRequest> {
    const images = data.imageUrl
      ? [
          {
            id: 'img-' + Date.now(),
            service_request_id: '',
            storage_path: 'service-images/' + Date.now() + '.jpg',
            public_url: data.imageUrl,
            created_at: new Date().toISOString(),
          },
        ]
      : [];

    const newReq = appStore.createRequest({
      client_id: data.client_id,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      status: 'pending',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_start: data.scheduled_start || '09:00',
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      urgency: data.urgency,
      images,
    });

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('service_requests').insert([
          {
            id: newReq.id,
            client_id: newReq.client_id,
            category_id: newReq.category_id,
            title: newReq.title,
            description: newReq.description,
            status: newReq.status,
            address: newReq.address,
            latitude: newReq.latitude,
            longitude: newReq.longitude,
            urgency: newReq.urgency,
          },
        ]);
      } catch (e) {
        console.warn('Supabase sync warning:', e);
      }
    }

    return newReq;
  },

  updateStatus(id: string, status: ServiceRequestStatus) {
    appStore.updateRequestStatus(id, status);
  },
};
