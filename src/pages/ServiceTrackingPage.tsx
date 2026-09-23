import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  Star, 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { serviceRequestService } from '../services/serviceRequestService';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { ServiceTimeline } from '../components/ServiceTimeline';
import { ServiceRequest, ServiceTrackingStatus } from '../types';
import { normalizeStatus, getStatusMeta } from '../lib/statusRules';

export const ServiceTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, professionals, currentUser, openAuthModal } = useApp();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Sync request with real-time updates
  useEffect(() => {
    if (!id) return;
    const found = serviceRequestService.getById(id);
    if (found) {
      setRequest(found);
    }
  }, [id, requests]);

  if (!request) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white font-display">Solicitação não encontrada</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          Não localizamos o serviço com o identificador informado em Imperatriz - MA.
        </p>
        <Link
          to="/cliente"
          className="mt-6 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-sm transition shadow-lg"
        >
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  const currentStatus: ServiceTrackingStatus = normalizeStatus(request.status);
  const isCompleted = currentStatus === 'COMPLETED';
  const isCancelled = currentStatus === 'CANCELLED';

  // Find assigned professional
  const assignedPro = request.selected_professional || 
    (request.quotes?.find(q => q.status === 'accepted')?.professional) ||
    (request.selected_professional_id ? professionals.find(p => p.id === request.selected_professional_id) : null);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(request.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleCancelService = () => {
    serviceRequestService.updateStatus(request.id, 'CANCELLED', undefined, 'Solicitação cancelada pelo cliente.');
    setCancelModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/cliente')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos pedidos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            PEDIDO #{request.id.replace('req-', '').substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Main Header / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
              Acompanhamento de Serviço
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <span className="text-[11px] text-slate-400 font-medium">Imperatriz - MA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
            {request.title}
          </h1>
        </div>

        {/* Action button if quoted or active */}
        {assignedPro && (
          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition shadow"
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              <span>Enviar mensagem</span>
            </Link>
          </div>
        )}
      </div>

      {/* 1. Highlighted Status Card */}
      <ServiceStatusCard
        request={request}
        professionalName={assignedPro?.profile?.full_name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Service Timeline Component */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <ServiceTimeline
              request={request}
              history={request.status_history}
            />
          </div>

          {/* 3. Service Details Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Detalhes da Solicitação</span>
            </h4>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {request.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Categoria</span>
                <span className="font-bold text-slate-200 mt-0.5 block truncate">
                  {request.category?.name || 'Serviço Geral'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Agendamento</span>
                <span className="font-bold text-slate-200 mt-0.5 block">
                  {request.scheduled_date || 'Hoje'} às {request.scheduled_start || '10:00'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs col-span-2 sm:col-span-1">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Prioridade</span>
                <span className={`font-bold mt-0.5 block ${request.urgency === 'urgent' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {request.urgency === 'urgent' ? '⚡ Urgente' : '✓ Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Professional Profile & Address Card */}
        <div className="space-y-6">
          {/* Professional Card */}
          {assignedPro ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                  Profissional Responsável
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verificado</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={assignedPro.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={assignedPro.profile?.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/60 shadow-md shrink-0"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">
                    {assignedPro.profile?.full_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{assignedPro.rating.toFixed(1)}</span>
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{assignedPro.total_services || 340} serviços</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {assignedPro.specialties?.slice(0, 2).join(', ') || 'Técnico Especialista'}
                  </div>
                </div>
              </div>

              {/* Direct action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/chat"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Direto</span>
                </Link>

                <a
                  href={`tel:${assignedPro.profile?.phone || '99991234567'}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ligar</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h4 className="font-bold text-white text-sm">Buscando Profissional</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estamos notificando técnicos especializados em Imperatriz. Assim que um orçamento for enviado, você poderá aprová-lo aqui.
              </p>
            </div>
          )}

          {/* Address & Service Location Card (No GPS, Pure Text & Copy) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Endereço de Atendimento</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                {request.address}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                <span>Cidade:</span>
                <span className="text-slate-300 font-medium">Imperatriz - MA</span>
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-700/80 transition cursor-pointer"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Endereço Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar endereço completo</span>
                </>
              )}
            </button>
          </div>

          {/* Cancellation Option if eligible */}
          {!isCompleted && !isCancelled && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setCancelModalOpen(true)}
                className="text-xs text-rose-400/80 hover:text-rose-400 transition font-medium underline underline-offset-4 cursor-pointer"
              >
                Precisa cancelar esta solicitação?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-display">Cancelar Solicitação?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tem certeza que deseja cancelar esta solicitação? O profissional será notificado imediatamente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelService}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
