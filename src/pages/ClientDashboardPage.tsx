import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Plus, 
  MessageSquare, 
  Truck, 
  Star, 
  CreditCard,
  ChevronRight,
  Shield,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { quoteService } from '../services/quoteService';
import { serviceRequestService } from '../services/serviceRequestService';
import { ServiceRequest, ServiceTrackingStatus } from '../types';
import { normalizeStatus, getStatusMeta } from '../lib/statusRules';
import { ServiceStatusCard } from '../components/ServiceStatusCard';
import { ServiceTimeline } from '../components/ServiceTimeline';

export const ClientDashboardPage: React.FC = () => {
  const { requests, openRequestModal, currentUser, refreshData } = useApp();
  const navigate = useNavigate();

  const [selectedTrackingRequest, setSelectedTrackingRequest] = useState<ServiceRequest | null>(
    requests[0] || null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAcceptQuote = (quoteId: string, requestId: string) => {
    quoteService.accept(quoteId, requestId);
    refreshData();
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find active ongoing service to feature prominently
  const activeService = requests.find(r => {
    const s = normalizeStatus(r.status);
    return ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'SCHEDULED', 'PROFESSIONAL_SELECTED'].includes(s);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-white">
                Painel do Cliente
              </h1>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/30">
                {currentUser.full_name || 'Lucas Ferreira'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Acompanhe seus chamados em Imperatriz - MA e aprove propostas em tempo real.
            </p>
          </div>

          <button
            onClick={() => openRequestModal()}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Solicitação de Serviço</span>
          </button>
        </div>

        {/* Featured: Serviço em Andamento (Prompt Section 18) */}
        {activeService && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-slate-900 border-2 border-orange-500/60 shadow-xl shadow-orange-950/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Serviço em Andamento
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {activeService.scheduled_date || 'Hoje'} • {activeService.scheduled_start || '10:30'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">
                    {activeService.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Profissional: <strong className="text-white">{activeService.selected_professional?.profile?.full_name || 'João Silva'}</strong>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    {getStatusMeta(activeService.status).badgeLabel}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getStatusMeta(activeService.status).clientDescription}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/solicitacoes/${activeService.id}`}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Acompanhar Serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Requests & Quotes List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-400" />
              Suas Solicitações ({requests.length})
            </h2>

            {requests.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-3">
                <p>Você ainda não solicitou nenhum serviço.</p>
                <button
                  onClick={() => openRequestModal()}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-bold"
                >
                  Solicitar Agora
                </button>
              </div>
            ) : (
              requests.map((req) => {
                const normStatus = normalizeStatus(req.status);
                const meta = getStatusMeta(normStatus);
                const isSelected = selectedTrackingRequest?.id === req.id;

                return (
                  <div
                    key={req.id}
                    className={`bg-slate-900 rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
                      isSelected
                        ? 'border-orange-500/60 shadow-xl shadow-orange-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top: Title & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{req.title}</h3>
                          {req.urgency === 'urgent' && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{req.description}</p>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${meta.colorClass}`}>
                          {meta.badgeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Meta: Location & Scheduled date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-1 truncate max-w-sm">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        {req.address}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(req.address, req.id)}
                        className="text-[11px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedId === req.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar endereço</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quotes Received Section */}
                    {req.quotes && req.quotes.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            Orçamentos Recebidos ({req.quotes.length}):
                          </span>
                          <span className="text-[11px] text-orange-400 font-semibold">
                            Escolha o profissional
                          </span>
                        </div>

                        <div className="space-y-2">
                          {req.quotes.map((quote) => {
                            const pro = quote.professional;
                            const isAccepted = quote.status === 'accepted';
                            return (
                              <div
                                key={quote.id}
                                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  isAccepted
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={pro?.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                                    alt={pro?.profile?.full_name}
                                    className="w-10 h-10 rounded-xl object-cover border border-orange-500/40"
                                  />
                                  <div>
                                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                                      <span>{pro?.profile?.full_name}</span>
                                      <span className="text-amber-400 font-normal">★ {pro?.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">{quote.description}</p>
                                    <span className="text-[10px] text-slate-500">
                                      Duração: {quote.estimated_duration}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block">Valor:</span>
                                    <span className="text-sm font-extrabold text-white">
                                      R$ {quote.amount.toFixed(2)}
                                    </span>
                                  </div>

                                  {isAccepted ? (
                                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Escolhido
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleAcceptQuote(quote.id, req.id)}
                                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow cursor-pointer"
                                    >
                                      Escolher Profissional
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Card bottom actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <button
                        onClick={() => setSelectedTrackingRequest(req)}
                        className={`text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'text-orange-400 underline underline-offset-4'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Visualizando Linha do Tempo' : 'Ver Linha do Tempo'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/solicitacoes/${req.id}`}
                          className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-xs border border-orange-500/30 transition flex items-center gap-1"
                        >
                          <span>Página de Acompanhamento</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Live Service Timeline (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-4">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Linha do Tempo em Tempo Real
              </div>

              {selectedTrackingRequest ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                  <ServiceStatusCard
                    request={selectedTrackingRequest}
                    professionalName={selectedTrackingRequest.selected_professional?.profile?.full_name}
                  />

                  <ServiceTimeline
                    request={selectedTrackingRequest}
                    history={selectedTrackingRequest.status_history}
                  />

                  <div className="pt-2">
                    <Link
                      to={`/solicitacoes/${selectedTrackingRequest.id}`}
                      className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      <span>Abrir Detalhes Completos do Serviço</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500 text-xs">
                  Selecione uma solicitação para acompanhar a linha do tempo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
