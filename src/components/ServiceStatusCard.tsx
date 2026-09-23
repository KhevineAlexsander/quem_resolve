import React from 'react';
import { 
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
  Clock
} from 'lucide-react';
import { ServiceRequest, ServiceTrackingStatus } from '../types';
import { getStatusMeta, normalizeStatus } from '../lib/statusRules';

interface ServiceStatusCardProps {
  request: ServiceRequest;
  professionalName?: string;
  className?: string;
}

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({
  request,
  professionalName,
  className = '',
}) => {
  const currentStatus: ServiceTrackingStatus = normalizeStatus(request.status);
  const meta = getStatusMeta(currentStatus);

  // Format updated time or scheduled time
  const updatedDate = request.updated_at ? new Date(request.updated_at) : new Date(request.created_at);
  const formattedTime = updatedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Select dynamic contextual icon
  const renderIcon = () => {
    switch (currentStatus) {
      case 'REQUESTED':
        return <FileText className="w-7 h-7 text-blue-400 animate-pulse" />;
      case 'PROFESSIONALS_NOTIFIED':
        return <Users className="w-7 h-7 text-indigo-400 animate-pulse" />;
      case 'QUOTE_RECEIVED':
        return <DollarSign className="w-7 h-7 text-amber-400" />;
      case 'PROFESSIONAL_SELECTED':
        return <UserCheck className="w-7 h-7 text-orange-400" />;
      case 'SCHEDULED':
        return <CalendarCheck className="w-7 h-7 text-cyan-400" />;
      case 'ON_THE_WAY':
        return <Truck className="w-8 h-8 text-orange-400 animate-bounce" />;
      case 'ARRIVED':
        return <MapPin className="w-8 h-8 text-emerald-400 animate-pulse" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-8 h-8 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case 'CANCELLED':
        return <XCircle className="w-8 h-8 text-rose-400" />;
      default:
        return <Clock className="w-7 h-7 text-slate-400" />;
    }
  };

  // Dynamic context descriptions
  const getContextDescription = () => {
    const pro = professionalName || request.selected_professional?.profile?.full_name || 'O profissional';
    switch (currentStatus) {
      case 'ON_THE_WAY':
        return `${pro} está indo até você.`;
      case 'ARRIVED':
        return `${pro} informou que chegou ao local.`;
      case 'IN_PROGRESS':
        return `${pro} está realizando o serviço no local.`;
      case 'COMPLETED':
        return 'Serviço concluído com sucesso. Avalie seu atendimento!';
      case 'SCHEDULED':
        return `Atendimento confirmado para ${request.scheduled_date || 'hoje'} às ${request.scheduled_start || 'horário marcado'}.`;
      case 'PROFESSIONAL_SELECTED':
        return `${pro} foi selecionado e o agendamento está em andamento.`;
      case 'QUOTE_RECEIVED':
        return 'Novas propostas recebidas. Analise e escolha seu profissional.';
      case 'PROFESSIONALS_NOTIFIED':
        return 'Técnicos qualificados foram acionados para avaliar seu pedido.';
      case 'REQUESTED':
        return 'Sua solicitação foi registrada no Quem Resolve.';
      case 'CANCELLED':
        return 'Esta solicitação foi cancelada.';
      default:
        return meta.clientDescription;
    }
  };

  // Card theme styling based on status severity / progression
  const getCardStyle = () => {
    switch (currentStatus) {
      case 'ON_THE_WAY':
        return 'from-orange-950/70 via-slate-900 to-slate-900 border-orange-500/60 shadow-orange-950/40';
      case 'ARRIVED':
        return 'from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/60 shadow-emerald-950/40';
      case 'IN_PROGRESS':
        return 'from-blue-950/70 via-slate-900 to-slate-900 border-blue-500/60 shadow-blue-950/40';
      case 'COMPLETED':
        return 'from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/70 shadow-emerald-950/50';
      case 'CANCELLED':
        return 'from-rose-950/50 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-950/20';
      default:
        return 'from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-slate-950/40';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getCardStyle()} p-5 sm:p-6 border shadow-xl transition-all ${className}`}
    >
      {/* Background ambient glow effect */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center shadow-inner shrink-0">
            {renderIcon()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                STATUS ATUAL
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Atualizado às {formattedTime}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-tight uppercase">
              {meta.title}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              {getContextDescription()}
            </p>
          </div>
        </div>

        {/* Live Pulse Indicator for active statuses */}
        {['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(currentStatus) && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[11px] font-bold text-orange-400 shrink-0 shadow">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            <span>Tempo Real</span>
          </div>
        )}
      </div>
    </div>
  );
};
