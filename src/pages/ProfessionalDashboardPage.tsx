import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Power, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Navigation, 
  Send, 
  MessageSquare,
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { quoteService } from '../services/quoteService';
import { serviceRequestService } from '../services/serviceRequestService';
import { professionalService } from '../services/professionalService';

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

  const handleUpdateStatus = (reqId: string, status: any) => {
    serviceRequestService.updateStatus(reqId, status);
    refreshData();
  };

  const activeJobs = requests.filter(r => 
    r.status === 'accepted' || 
    r.status === 'professional_on_way' || 
    r.status === 'in_progress'
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
                  Raio de {pro?.service_radius_km || 25} km
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
              className={`p-3 rounded-xl transition flex items-center gap-2 font-bold text-xs ${
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

        {/* Financial KPI Cards (Prompt Section 18) */}
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
            <div className="text-2xl font-extrabold text-white mt-2">28 atendimentos</div>
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

        {/* Active In-Progress Jobs Controls (Prompt Section 14) */}
        {activeJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <h2 className="font-bold text-lg text-white">
                Atendimento em Andamento (Ações do Técnico)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.map(job => (
                <div
                  key={job.id}
                  className="bg-slate-900 border-2 border-orange-500/50 rounded-3xl p-6 space-y-4 shadow-xl shadow-orange-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{job.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase">
                      {job.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>{job.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Agendado para: {job.scheduled_date} às {job.scheduled_start}</span>
                    </div>
                  </div>

                  {/* Actions according to current step */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Avançar status do chamado:
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {job.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'professional_on_way')}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Iniciar Deslocamento (A Caminho)</span>
                        </button>
                      )}

                      {job.status === 'professional_on_way' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Cheguei no Local (Iniciar Atendimento)</span>
                        </button>
                      )}

                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'completed')}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Concluir Serviço & Solicitar Pagamento</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate('/chat')}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-orange-400" />
                        <span>Chat com Cliente</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incoming Service Requests in Imperatriz (Opportunity Queue) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-400" />
              Chamados Disponíveis em Imperatriz ({pendingRequests.length})
            </h2>
            <span className="text-xs text-slate-400">
              Atualizado em tempo real via Supabase Realtime
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
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span className="truncate">{req.address} (2,3 km)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.scheduled_date} às {req.scheduled_start}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequestForQuote(req)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Orçamento / Proposta</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Enviar Orçamento */}
        {selectedRequestForQuote && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-400" />
                Enviar Proposta de Orçamento
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Para o chamado: <strong className="text-white">{selectedRequestForQuote.title}</strong>
              </p>

              <form onSubmit={handleSendQuote} className="space-y-4 my-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor total do serviço (R$):
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="180"
                    className="w-full bg-slate-950 text-white text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Taxa da plataforma: 10% (Você receberá R$ {(parseFloat(quoteAmount || '0') * 0.9).toFixed(2)})
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duração estimada:
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteDuration}
                    onChange={(e) => setQuoteDuration(e.target.value)}
                    placeholder="Ex: 1h a 2h"
                    className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detalhes da proposta e peças inclusas:
                  </label>
                  <textarea
                    rows={3}
                    value={quoteDescription}
                    onChange={(e) => setQuoteDescription(e.target.value)}
                    placeholder="Descreva o que está incluso no seu valor..."
                    className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequestForQuote(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingQuote}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25"
                  >
                    {isSendingQuote ? 'Enviando...' : 'Enviar ao Cliente'}
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
