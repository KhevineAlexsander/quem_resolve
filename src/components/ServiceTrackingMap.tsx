import React from 'react';
import { ServiceRequest } from '../types';
import { ServiceStatusCard } from './ServiceStatusCard';
import { ServiceTimeline } from './ServiceTimeline';

interface ServiceTrackingProps {
  request: ServiceRequest;
  onStatusChange?: () => void;
}

export const ServiceTrackingMap: React.FC<ServiceTrackingProps> = ({
  request,
}) => {
  return (
    <div className="space-y-4">
      <ServiceStatusCard
        request={request}
        professionalName={request.selected_professional?.profile?.full_name}
      />
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <ServiceTimeline
          request={request}
          history={request.status_history}
        />
      </div>
    </div>
  );
};
