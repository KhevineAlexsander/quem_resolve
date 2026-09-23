import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  Power, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Truck, 
  Send, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Wallet,
  Copy,
  Check,
  Play,
  ArrowRight,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { quoteService } from '../services/quoteService';
import { serviceRequestService } from '../services/serviceRequestService';
import { professionalService } from '../services/professionalService';
import { ServiceTrackingStatus } from '../types';
import { normalizeStatus, getStatusMeta, getProfessionalNextAction } from '../lib/statusRules';

export const ProfessionalDashboardPage: React.FC = () => {
  const { requests, professionals, currentUser, refreshData } = useApp();
  const navigate = useNavigate();

  const pro = professionals.find(p => p.profile?.email === currentUser.email) || professionals[0];
  const [isAvailable, setIsAvailable] = useState(pro?.is_available ?? true);
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<any | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('180');
  const [quoteDuration, setQuoteDuration] = useState('1 hora e meia');
  const [quoteDescription, setQuoteDescription] = useState('Diagnóstico completo, limpeza e carga de gás.');
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleToggleAvailability = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    professionalService.toggleAvailability(pro.id, next);
    refreshData();
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForQuote) return;
    setIsSendingQuote(true);

    quoteService.create({
      service_request_id: selectedRequestForQuote.id,
      professional_id: pro.id,
      amount: parseFloat(quoteAmount) || 150,
      description: quoteDescription,
      estimated_duration: quoteDuration,
    });

    setIsSendingQuote(false);
    setSelectedRequestForQuote(null);
    refreshData();
  };

  const handleAdvanceStatus = (reqId: string, nextStatus: ServiceTrackingStatus) => {
    setStatusError(null);
    const result = serviceRequestService.updateStatus(reqId, nextStatus, pro.profile?.full_name);
    if (!result.success) {
      setStatusError(result.error || 'Erro ao atualizar status.');
      setTimeout(() => setStatusError(null), 4000);
    } else {
      refreshData();
    }
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Jobs assigned to or chosen for this professional
  const myAssignedJobs = requests.filter(r => {
    const norm = normalizeStatus(r.status);
    return ['PROFESSIONAL_SELECTED', 'SCHEDULED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(norm);
  });

  const pendingRequests = requests.filter(r => {
    const norm = normalizeStatus(r.status);
    return ['REQUESTED', 'PROFESSIONALS_NOTIFIED', 'QUOTE_RECEIVED'].includes(norm);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Error Toast */}
        {statusError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-semibold">{statusError}</span>
            </div>
            <button onClick={() => setStatusError(null)} className="text-xs font-bold text-rose-400">
              ✕
            </button>
          </div>
        )}

        {/* Top Profile & Availability Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={pro?.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={pro?.profile?.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-white">
                  {pro?.profile?.full_name || 'João Silva'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Verificado
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                Técnico Especialista em Refrigeração e Climatização • Imperatriz - MA
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {pro?.rating.toFixed(1)} ({pro?.total_reviews} avaliações)
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  Atendendo em Imperatriz e Região
                </span>
              </div>
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-4 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">Status de Atendimento:</div>
              <div className={`text-[11px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isAvailable ? '● Disponível para chamados' : '○ Modo Invisível / Offline'}
              </div>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`p-3 rounded-xl transition flex items-center gap-2 font-bold text-xs cursor-pointer ${
                isAvailable
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Power className="w-4 h-4 stroke-[3]" />
              <span>{isAvailable ? 'Online' : 'Ficar Online'}</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Ganhos no Mês</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">R$ 3.840,00</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% em relação ao mês anterior
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Saldo Disponível (PIX)</span>
              <Wallet className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-orange-400 mt-2">R$ 1.250,00</div>
            <div className="text-[11px] text-slate-400 mt-1">Repasse imediato após conclusão</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Serviços Realizados</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">342 atendimentos</div>
            <div className="text-[11px] text-slate-400 mt-1">Taxa de conclusão de 100%</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Taxa da Plataforma</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-400 mt-2">10%</div>
            <div className="text-[11px] text-slate-400 mt-1">Você retém 90% do valor bruto</div>
          </div>
        </div>

        {/* Active In-Progress Jobs Controls (Prompt Section 8 & 19) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <h2 className="font-bold text-lg text-white">
                Serviços de Hoje / Ordens em Andamento ({myAssignedJobs.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Acompanhamento determinístico por status
            </span>
          </div>

          {myAssignedJobs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              Nenhum serviço em execução no momento. Envie propostas para os chamados disponíveis abaixo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAssignedJobs.map(job => {
                const normStatus = normalizeStatus(job.status);
                const meta = getStatusMeta(normStatus);
                const nextAction = getProfessionalNextAction(normStatus);

                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border-2 border-orange-500/50 rounded-3xl p-6 space-y-4 shadow-xl shadow-orange-950/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                          SERVIÇO #{job.id.replace('req-', '').substring(0, 6)}
                        </span>
                        <h3 className="font-bold text-base text-white mt-0.5">{job.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Cliente: <strong className="text-slate-200">{job.client?.full_name || 'Lucas Ferreira'}</strong></span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${meta.colorClass}`}>
                        {meta.badgeLabel}
                      </span>
                    </div>

                    {/* Address Box with Copy Button (Prompt Section 15) */}
                    <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-200 block">{job.address}</span>
                            <span className="text-[11px] text-slate-500 block">Imperatriz - MA</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyAddress(job.address, job.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedId === job.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-900 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Agendado para: {job.scheduled_date || 'Hoje'} às {job.scheduled_start || '10:30'}</span>
                      </div>
                    </div>

                    {/* Contextual Action Button according to status (Prompt Section 8) */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Atualizar Etapa do Atendimento:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {nextAction && (
                          <button
                            onClick={() => handleAdvanceStatus(job.id, nextAction.nextStatus!)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${nextAction.buttonColorClass}`}
                          >
                            {nextAction.iconName === 'Truck' && <Truck className="w-4 h-4" />}
                            {nextAction.iconName === 'MapPin' && <MapPin className="w-4 h-4" />}
                            {nextAction.iconName === 'Play' && <Play className="w-4 h-4" />}
                            {nextAction.iconName === 'CheckCircle2' && <CheckCircle2 className="w-4 h-4" />}
                            <span>{nextAction.buttonLabel}</span>
                          </button>
                        )}

                        <Link
                          to={`/solicitacoes/${job.id}`}
                          className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                        >
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>Timeline</span>
                        </Link>

                        <button
                          onClick={() => navigate('/chat')}
                          className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-orange-400" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incoming Service Requests in Imperatriz (Opportunity Queue) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-400" />
              Chamados Disponíveis em Imperatriz ({pendingRequests.length})
            </h2>
            <span className="text-xs text-slate-400">
              Notificações em tempo real
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white">{req.title}</h3>
                    {req.urgency === 'urgent' ? (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md shrink-0">
                        Urgente
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-md shrink-0">
                        Normal
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{req.description}</p>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{req.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{req.scheduled_date} às {req.scheduled_start}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequestForQuote(req)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Orçamento</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Send Quote Modal */}
        {selectedRequestForQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-lg text-white">
                  Enviar Orçamento de Serviço
                </h3>
                <button
                  onClick={() => setSelectedRequestForQuote(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-orange-400">{selectedRequestForQuote.title}</span>
                <p className="text-xs text-slate-400">{selectedRequestForQuote.description}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Local: {selectedRequestForQuote.address}
                </div>
              </div>

              <form onSubmit={handleSendQuote} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Valor da sua Proposta (R$):
                  </label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    required
                    min="10"
                    step="5"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: 180"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tempo Estimado:
                  </label>
                  <input
                    type="text"
                    value={quoteDuration}
                    onChange={(e) => setQuoteDuration(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: 1 a 2 horas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descrição do que está incluso:
                  </label>
                  <textarea
                    value={quoteDescription}
                    onChange={(e) => setQuoteDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: Visita técnica, mão de obra completa e garantia de 90 dias."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestForQuote(null)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingQuote}
                    className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    {isSendingQuote ? 'Enviando...' : 'Confirmar e Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
