import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { Professional } from '../types';

interface ProfessionalCardProps {
  professional: Professional;
  distanceKm?: number;
  onRequestQuote: (pro: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  distanceKm,
  onRequestQuote,
}) => {
  const profile = professional.profile;
  const name = profile?.full_name || 'Profissional Verificado';
  const avatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  const specialties = professional.specialties || ['Climatização', 'Manutenção'];

  return (
    <div 
      id={`pro-card-${professional.id}`}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top: Photo, Status, Rating & Distance */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md group-hover:scale-105 transition"
            />
            {professional.verification_status === 'verified' && (
              <div 
                title="Profissional Verificado"
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                {name}
              </h3>
              {professional.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Shield className="w-3 h-3 text-emerald-600" /> Verificado
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {specialties[0] ? `Especialista em ${specialties[0]}` : 'Técnico Especializado'}
            </p>

            {/* Rating & Distance badges */}
            <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                {professional.rating.toFixed(1)}
                <span className="text-slate-400 font-normal">({professional.total_reviews})</span>
              </span>

              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {distanceKm !== undefined ? `${distanceKm} km` : '2,3 km'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        {professional.bio && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {professional.bio}
          </p>
        )}

        {/* Specialties pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {specialties.slice(0, 3).map((spec, i) => (
            <span
              key={i}
              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
            >
              {spec}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="text-[11px] font-medium bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">
              +{specialties.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price & CTA */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            A partir de
          </span>
          <span className="text-base font-extrabold text-slate-900">
            R$ {professional.hourly_rate || 120}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/profissional/${professional.id}`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Ver perfil completo"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => onRequestQuote(professional)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition cursor-pointer"
          >
            Solicitar orçamento
          </button>
        </div>
      </div>
    </div>
  );
};
