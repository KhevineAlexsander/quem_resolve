import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Plus, 
  MessageSquare, 
  Navigation, 
  Star, 
  CreditCard,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceTrackingMap } from '../components/ServiceTrackingMap';
import { quoteService } from '../services/quoteService';
import { ServiceRequest } from '../types';

export const ClientDashboardPage: React.FC = () => {
  const { requests, openRequestModal, currentUser, refreshData } = useApp();
  const navigate = useNavigate();

  const [selectedTrackingRequest, setSelectedTrackingRequest] = useState<ServiceRequest | null>(
    requests[0] || null
  );

  const handleAcceptQuote = (quoteId: string, requestId: string) => {
    quoteService.accept(quoteId, requestId);
    refreshData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'professional_on_way':
        return <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center gap-1"><Navigation className="w-3 h-3 animate-spin" /> A Caminho</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1">⚡ Em Atendimento</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Concluído</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">Profissional Confirmado</span>;
      case 'quotes_received':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">Propostas Recebidas</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">Buscando Profissionais</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-white">
                Painel do Cliente
              </h1>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                Lucas Ferreira
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Acompanhe seus chamados em Imperatriz - MA e aprove propostas em tempo real.
            </p>
          </div>

          <button
            onClick={() => openRequestModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 hover:from-orange-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Solicitação de Serviço</span>
          </button>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Requests & Quotes List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-400" />
              Suas Solicitações de Serviço
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
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-slate-900 rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
                    selectedTrackingRequest?.id === req.id
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
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  {/* Meta: Location & Scheduled date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {req.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {req.scheduled_date} às {req.scheduled_start}
                    </span>
                  </div>

                  {/* Quotes Received Comparison (Prompt Section 11) */}
                  {req.quotes && req.quotes.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Orçamentos Recebidos ({req.quotes.length}):
                        </span>
                        <span className="text-[11px] text-orange-400 font-semibold">
                          Compare e escolha o profissional
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
                                    Duração estimada: {quote.estimated_duration}
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
                                    Aprovado
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleAcceptQuote(quote.id, req.id)}
                                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow cursor-pointer"
                                  >
                                    Aprovar Proposta
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
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTrackingRequest(req)}
                      className={`text-xs font-bold flex items-center gap-1.5 transition ${
                        selectedTrackingRequest?.id === req.id
                          ? 'text-orange-400 underline'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{selectedTrackingRequest?.id === req.id ? 'Visualizando Rastreamento' : 'Acompanhar no Mapa'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/chat')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                        <span>Conversar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Live Mobile Tracking Simulation (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Visualização do Aplicativo Mobile
              </div>

              {selectedTrackingRequest ? (
                <ServiceTrackingMap
                  request={selectedTrackingRequest}
                  onStatusChange={() => refreshData()}
                />
              ) : (
                <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500 text-xs">
                  Selecione uma solicitação para acompanhar o deslocamento em tempo real.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
