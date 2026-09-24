import { appStore } from '../lib/store';
import { supabaseSyncService } from './supabaseSyncService';
import { ServiceRequest, ServiceTrackingStatus, ServiceStatusHistory } from '../types';

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

  getStatusHistory(requestId: string): ServiceStatusHistory[] {
    return appStore.getStatusHistory(requestId);
  },

  async create(data: {
    client_id: string;
    category_id: string;
    title: string;
    description: string;
    address: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    complement?: string;
    city?: string;
    state?: string;
    cep?: string;
    latitude?: number;
    longitude?: number;
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
      status: 'REQUESTED',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_start: data.scheduled_start || '09:00',
      address: data.address,
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      complement: data.complement,
      city: data.city || 'Imperatriz',
      state: data.state || 'MA',
      cep: data.cep,
      latitude: data.latitude || -5.5266,
      longitude: data.longitude || -47.4797,
      urgency: data.urgency,
      images,
    });

    // Sincroniza em tempo real com o Supabase
    supabaseSyncService.syncServiceRequest(newReq).catch(err => {
      console.warn('Falha na sincronização assíncrona do pedido com Supabase:', err);
    });

    return newReq;
  },

  updateStatus(
    id: string, 
    status: ServiceTrackingStatus | string, 
    proName?: string,
    customDescription?: string
  ): { success: boolean; error?: string } {
    const result = appStore.updateRequestStatus(id, status, proName, customDescription);
    
    if (result.success) {
      const updatedReq = appStore.getRequestById(id);
      if (updatedReq) {
        supabaseSyncService.syncServiceRequest(updatedReq);
      }
      
      const historyList = appStore.getStatusHistory(id);
      const latestHistory = historyList[historyList.length - 1];
      if (latestHistory) {
        supabaseSyncService.syncStatusHistory(latestHistory);
      }
    }

    return result;
  },
};
