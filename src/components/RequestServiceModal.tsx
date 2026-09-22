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
  Crosshair
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { serviceRequestService } from '../services/serviceRequestService';
import { IMPERATRIZ_CENTER } from '../lib/initialData';
import { geocodeAddress } from '../lib/googleMaps';
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
  const [address, setAddress] = useState('Rua Ceará, 450 - Juçara, Imperatriz - MA');
  const [latitude, setLatitude] = useState(IMPERATRIZ_CENTER.lat);
  const [longitude, setLongitude] = useState(IMPERATRIZ_CENTER.lng);
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

  // Classificação determinística por palavras-chave cadastradas (100% sem IA)
  const runKeywordClassification = (text: string) => {
    const result = classifyServiceProblem(text);
    if (result) {
      setKeywordMatch(result);
      setSelectedCategorySlug(result.categorySlug);
    } else {
      setKeywordMatch(null);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress('Localização aproximada via GPS, Imperatriz - MA');
        },
        () => {
          setAddress('Centro, Imperatriz - MA');
        }
      );
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cat = categories.find(c => c.slug === selectedCategorySlug) || categories[0];
      const coords = await geocodeAddress(address);

      const created = await serviceRequestService.create({
        client_id: currentUser.id,
        category_id: cat.id,
        title: title || `Serviço de ${cat.name}`,
        description: description || title,
        address: coords.placeName || address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        urgency,
        scheduled_date: scheduledDate,
        scheduled_start: scheduledStart,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      });

      refreshData();
      closeRequestModal();
      navigate(`/cliente`);
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
                {step === 3 && 'Onde e Quando?'}
                {step === 4 && 'Fotos & Revisão'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Profissionais qualificados em Imperatriz - MA
              </p>
            </div>
          </div>

          <button
            onClick={closeRequestModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Problem Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descreva o problema com suas palavras:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setTitle(e.target.value.slice(0, 50));
                    runKeywordClassification(e.target.value);
                  }}
                  placeholder="Ex: Meu ar-condicionado parou de gelar e está fazendo um barulho estranho..."
                  className="w-full bg-slate-950 text-white text-sm p-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition placeholder:text-slate-500"
                />
              </div>

              {/* Quick suggestions chips */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">Sugestões rápidas:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Instalação de ar-condicionado Split',
                    'Vazamento de água na cozinha',
                    'Troca de disjuntor e fiação',
                    'Limpeza pesada pós-obra',
                    'Montagem de guarda-roupa',
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDescription(sug);
                        setTitle(sug);
                        runKeywordClassification(sug);
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorização determinística por palavras-chave (100% sem IA) */}
              {keywordMatch && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Categoria compatível identificada:</span>
                  </div>
                  <p className="text-slate-300">
                    Categoria: <strong className="text-white capitalize">{keywordMatch.categorySlug}</strong>
                  </p>
                  <p className="text-slate-300">
                    Serviço correspondente: <strong className="text-white">{keywordMatch.serviceTitle}</strong>
                  </p>
                  {keywordMatch.matchedKeywords.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span>Termos encontrados:</span>
                      {keywordMatch.matchedKeywords.map((kw, idx) => (
                        <span key={idx} className="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Category & Urgency */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Selecione a categoria:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`p-3 rounded-2xl text-left border transition flex flex-col justify-between ${
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
                    className={`p-3 rounded-2xl border text-left transition ${
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
                    className={`p-3 rounded-2xl border text-left transition ${
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

          {/* STEP 3: Location & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Endereço do atendimento em Imperatriz - MA:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número e bairro..."
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-28 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                  />
                  <MapPin className="w-4 h-4 text-orange-500 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 flex items-center gap-1 transition"
                  >
                    <Crosshair className="w-3 h-3 text-orange-400" />
                    <span>Usar GPS</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Atendemos toda a cidade de Imperatriz (Juçara, Centro, Bacuri, Nova Imperatriz, etc.)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Data preferida:
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Horário aproximado:
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
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
                      onClick={() =>
                        setImageUrl(
                          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
                        )
                      }
                      className="space-y-1"
                    >
                      <Camera className="w-8 h-8 text-orange-400 mx-auto" />
                      <div className="text-xs font-semibold text-slate-200">
                        Clique para adicionar foto do problema
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Armazenado com segurança no Supabase Storage
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Categoria:</span>
                  <span className="font-bold text-white">{selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Urgência:</span>
                  <span className={`font-bold ${urgency === 'urgent' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {urgency === 'urgent' ? 'Urgente' : 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Endereço:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[200px]">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data/Horário:</span>
                  <span className="font-medium text-slate-200">{scheduledDate} às {scheduledStart}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !description.trim()) return;
                setStep(step + 1);
              }}
              disabled={step === 1 && !description.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-orange-500/25 cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-orange-500/30 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Enviando...' : 'Solicitar Profissionais'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
