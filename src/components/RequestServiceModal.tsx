import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Building,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { serviceRequestService } from '../services/serviceRequestService';
import { classifyServiceProblem, ClassificationResult } from '../lib/deterministicSearch';

export const RequestServiceModal: React.FC = () => {
  const { 
    isRequestModalOpen, 
    closeRequestModal, 
    categories, 
    currentUser, 
    prefillRequestData,
    refreshData 
  } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('climatizacao');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  // Structured address fields (Prompt Section 1 & 15)
  const [street, setStreet] = useState('Rua Ceará');
  const [number, setNumber] = useState('450');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('Juçara');
  const [city, setCity] = useState('Imperatriz');
  const [state, setState] = useState('MA');
  const [cep, setCep] = useState('65900-000');

  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledStart, setScheduledStart] = useState('14:00');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywordMatch, setKeywordMatch] = useState<ClassificationResult | null>(null);

  useEffect(() => {
    if (prefillRequestData.categorySlug) {
      setSelectedCategorySlug(prefillRequestData.categorySlug);
    }
    if (prefillRequestData.title) {
      setTitle(prefillRequestData.title);
      setDescription(prefillRequestData.title);
      runKeywordClassification(prefillRequestData.title);
    }
  }, [prefillRequestData]);

  if (!isRequestModalOpen) return null;

  // Classificação determinística por palavras-chave
  const runKeywordClassification = (text: string) => {
    const result = classifyServiceProblem(text);
    if (result) {
      setKeywordMatch(result);
      setSelectedCategorySlug(result.categorySlug);
    } else {
      setKeywordMatch(null);
    }
  };

  const getFullFormattedAddress = () => {
    let base = `${street.trim()}, ${number.trim()}`;
    if (complement.trim()) base += ` (${complement.trim()})`;
    base += ` - ${neighborhood.trim()}, ${city.trim()} - ${state.trim()}`;
    if (cep.trim()) base += ` - CEP: ${cep.trim()}`;
    return base;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cat = categories.find(c => c.slug === selectedCategorySlug) || categories[0];
      const formattedAddress = getFullFormattedAddress();

      const created = await serviceRequestService.create({
        client_id: currentUser.id,
        category_id: cat.id,
        title: title || `Serviço de ${cat.name}`,
        description: description || title,
        address: formattedAddress,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        cep,
        urgency,
        scheduled_date: scheduledDate,
        scheduled_start: scheduledStart,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      });

      refreshData();
      closeRequestModal();
      navigate(`/solicitacoes/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.slug === selectedCategorySlug);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="request-modal-container"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 font-bold flex items-center justify-center text-sm">
              {step}/4
            </span>
            <div>
              <h2 className="font-display font-bold text-base text-slate-100">
                {step === 1 && 'O que você precisa resolver hoje?'}
                {step === 2 && 'Escolha a Categoria & Urgência'}
                {step === 3 && 'Endereço & Agendamento'}
                {step === 4 && 'Fotos & Revisão'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Profissionais qualificados em Imperatriz - MA
              </p>
            </div>
          </div>

          <button 
            onClick={closeRequestModal}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 w-full bg-slate-800">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Description & Title */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título ou Resumo do Serviço:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    runKeywordClassification(e.target.value);
                  }}
                  placeholder="Ex: Instalação de ar split 12000 BTUs no quarto"
                  className="w-full bg-slate-950 text-white text-xs px-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descreva o problema com mais detalhes:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Ex: O aparelho está pingando água para dentro do quarto e não está gelando direito..."
                  className="w-full bg-slate-950 text-white text-xs p-4 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition shadow-inner"
                />
              </div>

              {keywordMatch && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-orange-400 block">
                      Reconhecimento de Serviço
                    </span>
                    <span className="text-slate-300">
                      Detectamos: <strong>{keywordMatch.categoryName}</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Category & Urgency */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Selecione a categoria:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`p-3 rounded-2xl text-left border transition flex flex-col justify-between cursor-pointer ${
                        selectedCategorySlug === cat.slug
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-1">
                        {cat.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Nível de urgência:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      urgency === 'normal'
                        ? 'bg-slate-800 border-orange-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">Normal</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Posso agendar com calma</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      urgency === 'urgent'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Urgente (Hoje)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Preciso o mais rápido possível</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Structured Address & Schedule (No GPS) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>Endereço para Atendimento</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Imperatriz - MA
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Rua / Avenida:
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua Ceará"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Número:
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 450"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Bairro:
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Juçara, Centro, Bacuri"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Complemento / Apto:
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Ex: Apto 201, Bloco B"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cidade / Estado:
                  </label>
                  <input
                    type="text"
                    value={`${city} - ${state}`}
                    disabled
                    className="w-full bg-slate-950/60 text-slate-400 text-xs px-3 py-2.5 rounded-xl border border-slate-800 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    CEP:
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="65900-000"
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Scheduled Date and Time */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Data do atendimento:
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Horário aproximado:
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photo & Final Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adicionar foto do local/equipamento (opcional):
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 transition flex flex-col items-center justify-center">
                  {imageUrl ? (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Foto do serviço"
                        className="w-40 h-28 object-cover rounded-xl border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80')}
                      className="space-y-2 py-2"
                    >
                      <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-400">
                        Clique para anexar ou simular foto do local
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Resumo da sua solicitação:
                </span>
                <div className="space-y-1">
                  <div className="text-white font-bold">{title || 'Manutenção geral'}</div>
                  <div className="text-slate-400">{description || 'Sem detalhes adicionais'}</div>
                  <div className="text-orange-400 pt-1 font-medium">
                    Categoria: {selectedCategory?.name} • Prioridade {urgency === 'urgent' ? '⚡ Urgente' : 'Normal'}
                  </div>
                  <div className="text-slate-400 pt-1">
                    Endereço: {getFullFormattedAddress()}
                  </div>
                  <div className="text-slate-400">
                    Data: {scheduledDate} às {scheduledStart}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-orange-500/25 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Publicando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publicar e Iniciar Linha do Tempo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
