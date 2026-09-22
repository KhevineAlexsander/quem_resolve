import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Phone, 
  MessageSquare, 
  Navigation, 
  MapPin, 
  ChevronRight, 
  Star,
  Check,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { ServiceRequest, ServiceRequestStatus } from '../types';
import { appStore } from '../lib/store';
import { useApp } from '../context/AppContext';

interface ServiceTrackingMapProps {
  request: ServiceRequest;
  onStatusChange?: (status: ServiceRequestStatus) => void;
}

export const ServiceTrackingMap: React.FC<ServiceTrackingMapProps> = ({
  request,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { currentUser, refreshData } = useApp();
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [carProgress, setCarProgress] = useState(35); // percentage along the route
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const acceptedQuote = request.quotes?.find(q => q.status === 'accepted') || request.quotes?.[0];
  const pro = acceptedQuote?.professional || appStore.getProfessionals()[0];
  const proName = pro?.profile?.full_name || 'João Silva';
  const proAvatar = pro?.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  // Live simulation ticker for moving car
  useEffect(() => {
    if (request.status === 'professional_on_way') {
      const interval = setInterval(() => {
        setCarProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 2;
        });
        setEtaMinutes(prev => (prev > 2 ? prev - 1 : 2));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [request.status]);

  const handleUpdateStatus = (newStatus: ServiceRequestStatus) => {
    appStore.updateRequestStatus(request.id, newStatus);
    if (onStatusChange) onStatusChange(newStatus);
    refreshData();
  };

  const handleProcessPayment = () => {
    const amount = acceptedQuote ? acceptedQuote.amount : 180;
    appStore.processPayment(request.id, amount, pro.id, currentUser.id);
    setShowPaymentModal(false);
    setShowReviewModal(true);
    refreshData();
  };

  const handleSendReview = () => {
    if (!reviewComment.trim()) return;
    appStore.createReview({
      service_request_id: request.id,
      client_id: currentUser.id,
      professional_id: pro.id,
      rating: reviewRating,
      comment: reviewComment,
    });
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      refreshData();
    }, 1500);
  };

  const isStepCompleted = (step: string) => {
    const order: ServiceRequestStatus[] = [
      'pending',
      'quotes_received',
      'accepted',
      'professional_on_way',
      'in_progress',
      'completed',
    ];
    const currentIndex = order.indexOf(request.status);
    const targetIndex = order.indexOf(step as ServiceRequestStatus);
    return currentIndex >= targetIndex;
  };

  const isStepActive = (step: string) => {
    return request.status === step;
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
      {/* Phone Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-orange-500" />
          Acompanhamento em Tempo Real
        </h2>
        <span className="text-[11px] bg-slate-800 text-orange-400 font-bold px-2 py-0.5 rounded-full">
          #{request.id.slice(-5)}
        </span>
      </div>

      {/* Professional Mini Card */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={proAvatar}
              alt={proName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">{proName}</h3>
            <p className="text-xs text-slate-400">Técnico de Climatização</p>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mt-0.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9 (320 avaliações)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/chat')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Chat com o profissional"
          >
            <MessageSquare className="w-4 h-4 text-orange-400" />
          </button>
          <a
            href="tel:99991234567"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Ligar para o profissional"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Interactive Simulated Map with Route */}
      <div className="relative h-60 bg-[#0a121e] overflow-hidden border-b border-slate-800">
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 240">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b00" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Stylized city street grid */}
          <path d="M 0 60 L 400 60" stroke="#1e293b" strokeWidth="3" />
          <path d="M 0 130 L 400 130" stroke="#1e293b" strokeWidth="5" />
          <path d="M 0 190 L 400 190" stroke="#1e293b" strokeWidth="3" />
          <path d="M 80 0 L 80 240" stroke="#1e293b" strokeWidth="3" />
          <path d="M 190 0 L 190 240" stroke="#1e293b" strokeWidth="5" />
          <path d="M 310 0 L 310 240" stroke="#1e293b" strokeWidth="3" />
          
          {/* Main Transit Avenue - Av. Dorgival / Bernardo Sayão */}
          <text x="195" y="25" fill="#475569" fontSize="9" fontWeight="bold">Av. Bernardo Sayão</text>
          <text x="10" y="125" fill="#475569" fontSize="9" fontWeight="bold">Rua Ceará</text>

          {/* Active Route Path from Pro (Top-Right) to Client (Center-Left) */}
          <path
            d="M 310 50 L 190 50 L 190 130 L 110 130"
            fill="none"
            stroke="#f97316"
            strokeWidth="5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>

        {/* Client Marker (Destination) */}
        <div className="absolute top-[115px] left-[95px] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute inset-0"></div>
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs">
              📍
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              Seu Endereço
            </div>
          </div>
        </div>

        {/* Moving Professional Car Marker */}
        <div
          className="absolute z-20 transition-all duration-1000 ease-out"
          style={{
            top: carProgress < 50 ? '40px' : carProgress < 80 ? `${50 + (carProgress - 50) * 2.6}px` : '120px',
            left: carProgress < 50 ? `${310 - carProgress * 2.4}px` : carProgress < 80 ? '180px' : `${190 - (carProgress - 80) * 4}px`,
          }}
        >
          <div className="relative flex flex-col items-center group">
            <div className="w-9 h-9 rounded-2xl bg-orange-500 border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-extrabold text-sm animate-bounce">
              🚗
            </div>
            <div className="whitespace-nowrap bg-slate-900 text-orange-400 border border-orange-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md shadow mt-1">
              {proName.split(' ')[0]} ({etaMinutes} min)
            </div>
          </div>
        </div>

        {/* Live Tracking overlay badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Rastreamento GPS Ativo</span>
        </div>
      </div>

      {/* Dynamic Status Alert Banner */}
      <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-base shrink-0">
            {request.status === 'professional_on_way' && '🚗'}
            {request.status === 'in_progress' && '⚡'}
            {request.status === 'completed' && '✅'}
            {request.status === 'accepted' && '📋'}
            {request.status === 'quotes_received' && '💬'}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">
              {request.status === 'professional_on_way' && `${proName.split(' ')[0]} está a caminho`}
              {request.status === 'in_progress' && 'Serviço em andamento'}
              {request.status === 'completed' && 'Serviço concluído com sucesso'}
              {request.status === 'accepted' && 'Profissional confirmado'}
              {request.status === 'quotes_received' && 'Orçamentos disponíveis'}
            </h4>
            <p className="text-xs text-orange-400 font-medium">
              {request.status === 'professional_on_way' && `Chegada estimada em ${etaMinutes} minutos`}
              {request.status === 'in_progress' && 'O técnico está executando o serviço'}
              {request.status === 'completed' && 'Pagamento aprovado e garantia ativa'}
              {request.status === 'accepted' && 'Aguardando início do deslocamento'}
              {request.status === 'quotes_received' && 'Compare propostas e aprove'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>

      {/* Step-by-Step Progress Timeline matching mockup */}
      <div className="p-5 space-y-4">
        {/* Step 1: Solicitação enviada */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Solicitação enviada</span>
            <span className="text-xs text-slate-500">10:24</span>
          </div>
        </div>

        {/* Step 2: Profissional aceitou */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${isStepCompleted('accepted') ? 'text-emerald-400' : 'text-slate-600'}`}>
            {isStepCompleted('accepted') ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${isStepCompleted('accepted') ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>
              Profissional aceitou
            </span>
            <span className="text-xs text-slate-500">10:28</span>
          </div>
        </div>

        {/* Step 3: A caminho */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${isStepCompleted('professional_on_way') ? 'text-emerald-400' : 'text-slate-600'}`}>
            {isStepCompleted('professional_on_way') ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${isStepCompleted('professional_on_way') ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>
              A caminho
            </span>
            <span className="text-xs text-slate-500">10:42</span>
          </div>
        </div>

        {/* Step 4: Em atendimento */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${isStepCompleted('in_progress') ? 'text-emerald-400' : isStepActive('in_progress') ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`}>
            {isStepCompleted('in_progress') ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${isStepCompleted('in_progress') ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>
              Em atendimento
            </span>
            {isStepActive('in_progress') && <span className="text-xs text-orange-400 font-bold">Agora</span>}
          </div>
        </div>

        {/* Step 5: Concluído */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${request.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'}`}>
            {request.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${request.status === 'completed' ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>
              Concluído
            </span>
            {request.status === 'completed' && <span className="text-xs text-emerald-400 font-bold">Finalizado</span>}
          </div>
        </div>
      </div>

      {/* Simulator / Progression Quick Actions Bar */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Ações do Fluxo Interativo:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {request.status === 'accepted' && (
            <button
              onClick={() => handleUpdateStatus('professional_on_way')}
              className="col-span-2 py-2 px-3 rounded-xl bg-orange-500 text-slate-950 font-bold hover:bg-orange-600 transition shadow"
            >
              🚗 Simular: Profissional Saiu / A Caminho
            </button>
          )}

          {request.status === 'professional_on_way' && (
            <>
              <button
                onClick={() => {
                  setCarProgress(95);
                  setEtaMinutes(1);
                  handleUpdateStatus('in_progress');
                }}
                className="col-span-2 py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition shadow"
              >
                🏁 Chegou no Local & Iniciar Atendimento
              </button>
            </>
          )}

          {request.status === 'in_progress' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="col-span-2 py-2 px-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition shadow"
            >
              💳 Finalizar Serviço & Pagar (PIX)
            </button>
          )}

          {request.status === 'completed' && !reviewSubmitted && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="col-span-2 py-2 px-3 rounded-xl bg-orange-500 text-slate-950 font-bold hover:bg-orange-600 transition shadow"
            >
              ⭐ Avaliar Atendimento de {proName.split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      {/* Phone Bottom Actions */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
        >
          <MessageSquare className="w-4 h-4 text-orange-400" />
          <span>Chat</span>
        </button>

        <a
          href="tel:99991234567"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition text-center"
        >
          <Phone className="w-4 h-4" />
          <span>Ligar</span>
        </a>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              Pagamento do Serviço
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ambiente de Demonstração Seguro Quem Resolve
            </p>

            <div className="my-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Serviço:</span>
                <span className="font-semibold text-white">{request.title}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Valor Total:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  R$ {(acceptedQuote ? acceptedQuote.amount : 180).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                <span>Taxa da plataforma (10%):</span>
                <span>R$ {((acceptedQuote ? acceptedQuote.amount : 180) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Repasse ao profissional:</span>
                <span>R$ {((acceptedQuote ? acceptedQuote.amount : 180) * 0.9).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs mb-5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Garantia de 90 dias com nota emitida pelo app.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/30 hover:from-orange-600"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              Avaliar Atendimento
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Como foi sua experiência com {proName}?
            </p>

            {/* Stars Selector */}
            <div className="flex items-center justify-center gap-2 my-5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-2xl transition hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Escreva um comentário sobre o serviço prestado..."
              className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-orange-500 placeholder:text-slate-500 mb-4"
            />

            {reviewSubmitted ? (
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Avaliação registrada! Obrigado.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Depois
                </button>
                <button
                  onClick={handleSendReview}
                  disabled={!reviewComment.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition"
                >
                  Enviar Avaliação
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
