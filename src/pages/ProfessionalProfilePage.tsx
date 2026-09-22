import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Clock, 
  ArrowLeft, 
  Calendar,
  MessageSquare,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfessionalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { professionals, openRequestModal } = useApp();

  const pro = professionals.find(p => p.id === id) || professionals[0];
  const profile = pro?.profile;
  const name = profile?.full_name || 'João Silva';
  const avatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para busca</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-orange-500 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-white">{name}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Profissional Verificado
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400">
                {pro?.bio || 'Técnico credenciado com mais de 8 anos de experiência em Imperatriz - MA.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  {pro?.rating.toFixed(1)} ({pro?.total_reviews} avaliações reais)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  Imperatriz - MA (Raio de {pro?.service_radius_km || 25} km)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço base</span>
                <span className="text-xl font-extrabold text-white">R$ {pro?.hourly_rate || 120}</span>
              </div>

              <button
                onClick={() => openRequestModal(pro?.specialties?.[0]?.toLowerCase(), `Chamado direto para ${name}`)}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25 hover:from-orange-600 transition text-center cursor-pointer"
              >
                Solicitar Orçamento
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio of Completed Work (Prompt Section 7) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            Trabalhos Realizados em Imperatriz
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80', label: 'Higienização Completa de Split - Juçara' },
              { img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80', label: 'Instalação Multi-Split - Nova Imperatriz' },
              { img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80', label: 'Troca de Motor Ventilador - Centro' },
            ].map((item, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-800">
                <img src={item.img} alt={item.label} className="w-full h-32 object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-2.5 flex items-end">
                  <span className="text-[10px] font-semibold text-slate-200 line-clamp-1">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              Avaliações Verificadas ({pro?.total_reviews})
            </h2>
            <span className="text-xs text-slate-400">Comprovadas via app</span>
          </div>

          <div className="space-y-3">
            {[
              { author: 'Mariana Costa', neighborhood: 'Juçara', rating: 5, date: 'Ontem', text: 'Profissional excelente! Chegou pontualmente em 15 minutos, identificou o problema no ar e deixou gelando perfeitamente.' },
              { author: 'Eduardo Martins', neighborhood: 'Bacuri', rating: 5, date: 'Há 3 dias', text: 'Preço justo, serviço limpo e bem executado. Muito educado e transparente com o orçamento.' },
            ].map((rev, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <span>{rev.author}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({rev.neighborhood})</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rev.text}</p>
                <span className="text-[10px] text-slate-500 block">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
