import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MapView } from '../components/MapView';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { Professional } from '../types';
import { IMPERATRIZ_COORDS } from '../lib/mapbox';

export const HomePage: React.FC = () => {
  const { categories, professionals, openRequestModal } = useApp();
  const navigate = useNavigate();

  const [searchProblem, setSearchProblem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(professionals[0] || null);
  const [userCoords, setUserCoords] = useState({
    latitude: IMPERATRIZ_COORDS.latitude,
    longitude: IMPERATRIZ_COORDS.longitude,
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

  const filteredPros = professionals.filter(pro => {
    if (!selectedCategory) return true;
    const cat = categories.find(c => c.slug === selectedCategory);
    if (!cat) return true;
    return pro.specialties?.some(s => 
      s.toLowerCase().includes(cat.name.toLowerCase()) || 
      cat.name.toLowerCase().includes(s.toLowerCase())
    ) || (selectedCategory === 'climatizacao' && pro.id === 'pro-joao');
  });

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
      {/* Hero Section styled after the visual reference */}
      <section className="relative overflow-hidden pt-8 pb-14 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950">
        {/* Background glow elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-orange-400 text-xs font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                <span>Plataforma Oficial de Serviços em Imperatriz - MA</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                Você pede. <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Quem resolve, aparece.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Encontre em minutos técnicos de ar-condicionado, eletricistas, encanadores, diaristas e empresas de manutenção verificadas em Imperatriz e região com garantia e rastreamento ao vivo.
              </p>

              {/* Main Search Input Form */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-slate-900/90 p-2 rounded-2xl border border-slate-700/90 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-xl backdrop-blur-md"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-5 h-5 text-orange-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchProblem}
                    onChange={(e) => setSearchProblem(e.target.value)}
                    placeholder="Qual problema precisa resolver? Ex: Ar parou de gelar..."
                    className="w-full bg-transparent text-white text-xs sm:text-sm pl-11 pr-3 py-3 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Pedir Orçamento</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>

              {/* Quick Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Profissionais 100% Verificados
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Atendimento em até 30 minutos
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Pagamento Seguro e Garantia
                </span>
              </div>
            </div>

            {/* Right Hero: Highlighted Verified Professional Card (matching the image) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm">
                <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Técnico disponível agora perto de você:
                </div>
                {professionals[0] && (
                  <ProfessionalCard
                    professional={professionals[0]}
                    distanceKm={2.3}
                    onRequestQuote={(pro) => openRequestModal('climatizacao', `Solicitação de orçamento com ${pro.profile?.full_name}`)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Prompt Section 8) */}
      <section className="py-10 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                Categorias Mais Solicitadas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha o serviço ou deixe nossa IA identificar o especialista ideal
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-orange-400 hover:underline"
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

      {/* Interactive Map & Nearby Professionals Section (Prompt Section 5 & 14) */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Rastreamento e Proximidade
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Profissionais Próximos no Mapa de Imperatriz
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Veja a localização dos prestadores em tempo real nos bairros Centro, Juçara, Bacuri e Nova Imperatriz.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openRequestModal(selectedCategory || undefined)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <span>Solicitar Chamado Geral</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Two-column layout: Map on Left, Nearby Cards on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map Container */}
            <div className="lg:col-span-7">
              <MapView
                professionals={filteredPros}
                selectedProfessionalId={selectedPro?.id}
                onSelectProfessional={(pro) => setSelectedPro(pro)}
                userCoordinates={userCoords}
                onUserCoordinatesChange={(coords) => setUserCoords(coords)}
                heightClass="h-[480px]"
              />
            </div>

            {/* List of Professionals */}
            <div className="lg:col-span-5 space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{filteredPros.length} profissionais encontrados</span>
                <span className="text-orange-400 font-semibold">Ordenados por proximidade</span>
              </div>

              {filteredPros.map((pro) => (
                <ProfessionalCard
                  key={pro.id}
                  professional={pro}
                  distanceKm={pro.id === 'pro-joao' ? 2.3 : pro.id === 'pro-marcos' ? 3.1 : 4.5}
                  onRequestQuote={(p) => openRequestModal(selectedCategory || undefined, `Orçamento para ${p.profile?.full_name}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-14 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Simples, Rápido e Seguro
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
              Como funciona o Quem Resolve?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Da solicitação ao pagamento, tudo é feito pelo aplicativo com total transparência
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-orange-500/30 absolute top-4 right-4">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg mb-4">
                📝
              </div>
              <h3 className="font-bold text-base text-white mb-1">1. Peça o Serviço</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descreva o problema com fotos ou escolha uma categoria. Nossa plataforma localiza os profissionais mais próximos em Imperatriz.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-orange-500/30 absolute top-4 right-4">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
                💬
              </div>
              <h3 className="font-bold text-base text-white mb-1">2. Receba Orçamentos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare preços, prazos, avaliações e perfis verificados. Aprove o melhor orçamento com 1 clique.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-orange-500/30 absolute top-4 right-4">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                🚗
              </div>
              <h3 className="font-bold text-base text-white mb-1">3. Acompanhe no Mapa</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Veja o técnico se deslocando até sua casa em tempo real com previsão exata de chegada em minutos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-orange-500/30 absolute top-4 right-4">
                04
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-base text-white mb-1">4. Pague com Garantia</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pague pelo aplicativo somente após o serviço ser realizado. Todos os serviços contam com 90 dias de garantia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action for Professionals and Companies */}
      <section className="py-12 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
              Você é um profissional autônomo ou tem uma empresa?
            </h3>
            <p className="text-xs sm:text-sm font-semibold opacity-90 max-w-2xl">
              Cadastre-se no Quem Resolve para receber chamados diários de clientes em Imperatriz - MA com pagamento garantido.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/profissional')}
              className="px-5 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs sm:text-sm shadow-xl hover:bg-slate-900 transition"
            >
              Quero ser Profissional
            </button>
            <button
              onClick={() => navigate('/empresa')}
              className="px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:bg-slate-100 transition"
            >
              Cadastrar Empresa
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
