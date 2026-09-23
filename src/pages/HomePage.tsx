import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  Wrench,
  Zap,
  Droplets,
  Sparkles,
  Hammer,
  Truck,
  Paintbrush,
  Smartphone,
  ChevronRight,
  Bell,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { Professional } from '../types';
import { findMatchingProfessionals, classifyServiceProblem } from '../lib/deterministicSearch';
import { normalizeStatus, getStatusMeta } from '../lib/statusRules';

export const HomePage: React.FC = () => {
  const { categories, professionals, requests, openRequestModal } = useApp();
  const navigate = useNavigate();

  const [searchProblem, setSearchProblem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Active ongoing request for instant tracking banner
  const activeRequest = requests.find(r => {
    const s = normalizeStatus(r.status);
    return ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'SCHEDULED', 'QUOTE_RECEIVED'].includes(s);
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchProblem.trim()) {
      openRequestModal();
      return;
    }
    openRequestModal(undefined, searchProblem);
  };

  const handleCategoryClick = (catSlug: string) => {
    if (selectedCategory === catSlug) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catSlug);
    }
  };

  // Motor determinístico de busca por palavras-chave e ranqueamento
  const rankedResults = findMatchingProfessionals(professionals, categories, {
    categorySlug: selectedCategory || undefined,
    userQuery: searchProblem.trim() || undefined,
  });

  const detectedCategory = searchProblem.trim() ? classifyServiceProblem(searchProblem.trim()) : null;

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'climatizacao':
        return <Sparkles className="w-5 h-5 text-orange-400" />;
      case 'eletrica':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'hidraulica':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'limpeza':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'construcao':
        return <Hammer className="w-5 h-5 text-yellow-500" />;
      case 'pintura':
        return <Paintbrush className="w-5 h-5 text-purple-400" />;
      default:
        return <Wrench className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ongoing Service Quick Tracker Banner (if active request exists) */}
      {activeRequest && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-slate-950 px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-orange-400 flex items-center justify-center font-bold shadow-md shrink-0">
                <Truck className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950 text-white">
                    {getStatusMeta(activeRequest.status).badgeLabel}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-950">
                    {activeRequest.title}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  {getStatusMeta(activeRequest.status).clientDescription}
                </p>
              </div>
            </div>

            <Link
              to={`/solicitacoes/${activeRequest.id}`}
              className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow shrink-0 self-end sm:self-auto"
            >
              <span>Acompanhar Linha do Tempo</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-orange-400 text-xs font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                <span>Atendimento Rápido em Imperatriz - MA</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.15]">
                Você pede. <br className="hidden sm:inline" />
                <span className="text-orange-500">Quem resolve,</span> aparece.
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Encontre eletricistas, técnicos de ar-condicionado, encanadores e prestadores qualificados. Receba orçamentos e acompanhe cada etapa do seu serviço em tempo real.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-orange-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchProblem}
                    onChange={(e) => setSearchProblem(e.target.value)}
                    placeholder="Ex: Instalar ar-condicionado, trocar disjuntor, vazamento..."
                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border-2 border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition shadow-xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    Buscar
                  </button>
                </div>

                {/* Instant Problem Classifier Badge */}
                {detectedCategory && (
                  <div className="flex items-center gap-2 text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 px-3 py-1.5 rounded-xl animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>
                      Identificamos interesse em: <strong>{detectedCategory.categoryName}</strong>. Clique em buscar para solicitar orçamentos.
                    </span>
                  </div>
                )}
              </form>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Profissionais 100% Verificados
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Linha do Tempo em Tempo Real
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Garantia do Serviço
                </span>
              </div>
            </div>

            {/* Right Hero: Featured Professional Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm space-y-3">
                <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Técnico destaque disponível em Imperatriz:
                </div>
                {professionals[0] && (
                  <ProfessionalCard
                    professional={professionals[0]}
                    distanceKm={1.8}
                    onRequestQuote={(pro) => openRequestModal('climatizacao', `Solicitação de orçamento com ${pro.profile?.full_name}`)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-10 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                Categorias Mais Solicitadas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha o serviço desejado em Imperatriz e região
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-orange-400 hover:underline cursor-pointer"
              >
                Limpar filtro
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/20 scale-105'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-100 block">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {cat.slug === 'climatizacao' ? 'Ar e Refrigeração' : 'Ver técnicos'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Verified Professionals Showcase */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                Profissionais Verificados
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Especialistas Recomendados em Imperatriz - MA
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Profissionais avaliados nos bairros Centro, Juçara, Bacuri, Nova Imperatriz e Beira Rio.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openRequestModal(selectedCategory || undefined)}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <span>Criar Nova Solicitação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Professionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedResults.map(({ professional, distanceKm, matchReason }) => (
              <div key={professional.id} className="space-y-2">
                {matchReason && (
                  <div className="text-[11px] text-orange-400 font-semibold px-2">
                    {matchReason}
                  </div>
                )}
                <ProfessionalCard
                  professional={professional}
                  distanceKm={distanceKm}
                  onRequestQuote={(pro) => openRequestModal(selectedCategory || undefined, `Solicitação de orçamento com ${pro.profile?.full_name}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section with Timeline Preview */}
      <section className="py-14 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Como Funciona o Quem Resolve
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Acompanhamento Completo em 4 Passos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Do pedido à conclusão, você acompanha cada etapa com transparência e notificações em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                1
              </div>
              <h3 className="font-bold text-white text-base">Crie a Solicitação</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descreva o problema, informe seu endereço em Imperatriz e defina a data desejada.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                2
              </div>
              <h3 className="font-bold text-white text-base">Receba Propostas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Técnicos avaliam e enviam orçamentos com valor e horários. Escolha o melhor para você.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm border border-orange-500/20">
                3
              </div>
              <h3 className="font-bold text-white text-base">Linha do Tempo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saiba quando o técnico saiu a caminho, quando chegou ao local e quando iniciou o serviço.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                4
              </div>
              <h3 className="font-bold text-white text-base">Conclusão e Avaliação</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Serviço realizado com qualidade garantida. Avalie o profissional e fortaleça a comunidade local.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
