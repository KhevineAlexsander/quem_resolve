import React from 'react';
import { 
  Check, 
  Clock, 
  FileText, 
  Users, 
  DollarSign, 
  UserCheck, 
  CalendarCheck, 
  Truck, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  XCircle,
  Circle
} from 'lucide-react';
import { ServiceRequest, ServiceStatusHistory, ServiceTrackingStatus } from '../types';
import { STATUS_SEQUENCE, STATUS_DEFINITIONS, normalizeStatus } from '../lib/statusRules';

interface ServiceTimelineProps {
  request: ServiceRequest;
  history?: ServiceStatusHistory[];
  className?: string;
}

export const ServiceTimeline: React.FC<ServiceTimelineProps> = ({
  request,
  history = [],
  className = '',
}) => {
  const currentStatus = normalizeStatus(request.status);
  const isCancelled = currentStatus === 'CANCELLED';

  const currentIndex = isCancelled ? -1 : STATUS_SEQUENCE.indexOf(currentStatus);

  // Helper to find recorded history entry for a status
  const getHistoryEntry = (status: ServiceTrackingStatus) => {
    return (
      request.status_history?.find((h) => h.status === status) ||
      history.find((h) => h.status === status)
    );
  };

  const getStepIcon = (status: ServiceTrackingStatus) => {
    switch (status) {
      case 'REQUESTED':
        return <FileText className="w-3.5 h-3.5" />;
      case 'PROFESSIONALS_NOTIFIED':
        return <Users className="w-3.5 h-3.5" />;
      case 'QUOTE_RECEIVED':
        return <DollarSign className="w-3.5 h-3.5" />;
      case 'PROFESSIONAL_SELECTED':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'SCHEDULED':
        return <CalendarCheck className="w-3.5 h-3.5" />;
      case 'ON_THE_WAY':
        return <Truck className="w-3.5 h-3.5" />;
      case 'ARRIVED':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <Circle className="w-3.5 h-3.5" />;
    }
  };

  // Format timestamp nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return 'Hoje';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Linha do Tempo do Atendimento</span>
        </h4>
        <span className="text-[11px] font-semibold text-slate-400">
          Imperatriz - MA
        </span>
      </div>

      {isCancelled ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <div className="font-bold text-sm">Serviço Cancelado</div>
            <div className="text-xs text-rose-400/80">Esta solicitação foi finalizada como cancelada.</div>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-800">
          {STATUS_SEQUENCE.map((status, index) => {
            const def = STATUS_DEFINITIONS[status];
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            const entry = getHistoryEntry(status);
            const recordedTime = entry ? formatTime(entry.created_at) : null;
            const recordedDate = entry ? formatDate(entry.created_at) : null;

            // Contextual timestamp fallback for scheduled or requested
            let displayTime = recordedTime;
            if (!displayTime && isCompleted) {
              displayTime = 'Concluído';
            }
            if (status === 'SCHEDULED' && request.scheduled_date) {
              displayTime = `${request.scheduled_date === new Date().toISOString().split('T')[0] ? 'Hoje' : request.scheduled_date} às ${request.scheduled_start || '10:00'}`;
            }

            return (
              <div
                key={status}
                className={`relative flex items-start gap-4 transition-all duration-300 ${
                  isCurrent
                    ? 'scale-[1.01]'
                    : isPending
                    ? 'opacity-40'
                    : 'opacity-90'
                }`}
              >
                {/* Node icon / indicator */}
                <div
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-950/50'
                      : isCurrent
                      ? 'bg-orange-500 text-slate-950 border-orange-300 ring-4 ring-orange-500/20 shadow-lg shadow-orange-950/60 animate-pulse'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  )}
                </div>

                {/* Content block */}
                <div
                  className={`flex-1 p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900/95 border-orange-500/60 shadow-lg shadow-orange-950/20'
                      : isCompleted
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-slate-900/30 border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded-lg ${
                          isCurrent
                            ? 'bg-orange-500/20 text-orange-400'
                            : isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {getStepIcon(status)}
                      </span>
                      <h5
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? 'text-white'
                            : isCompleted
                            ? 'text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {def.title}
                      </h5>
                    </div>

                    {/* Timestamp or Status Badge */}
                    <div>
                      {isCompleted && (
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          {displayTime ? `✓ ${recordedDate ? `${recordedDate} ` : ''}${displayTime}` : '✓ Concluído'}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 shadow">
                          {displayTime ? `Atualizado às ${displayTime}` : 'Etapa Atual'}
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          ○ Aguardando
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contextual description */}
                  <p
                    className={`mt-1.5 text-xs leading-relaxed ${
                      isCurrent
                        ? 'text-slate-300 font-medium'
                        : isCompleted
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {entry?.description || def.clientDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
