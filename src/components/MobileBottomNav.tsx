import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Plus, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  onOpenRequestModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenRequestModal }) => {
  const location = useLocation();
  const { currentUser } = useApp();

  const getProfileLink = () => {
    switch (currentUser.role) {
      case 'PROFISSIONAL':
        return '/profissional';
      case 'EMPRESA':
        return '/empresa';
      case 'ADMIN':
        return '/admin';
      default:
        return '/cliente';
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 text-slate-400 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Início */}
        <Link
          to="/"
          id="mobile-nav-home"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${location.pathname === '/' ? 'text-orange-500' : 'hover:text-slate-200'}`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>

        {/* Serviços */}
        <Link
          to="/cliente"
          id="mobile-nav-services"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${location.pathname === '/cliente' ? 'text-orange-500' : 'hover:text-slate-200'}`}
        >
          <Wrench className="w-5 h-5" />
          <span>Serviços</span>
        </Link>

        {/* Central '+' Resolver algo button */}
        <div className="-mt-7">
          <button
            id="mobile-nav-request"
            onClick={onOpenRequestModal}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-orange-500/40 active:scale-95 transition-transform border-4 border-slate-900 cursor-pointer"
            aria-label="Resolver algo"
          >
            <Plus className="w-7 h-7 stroke-[3] text-slate-950" />
          </button>
        </div>

        {/* Chat / Mensagens */}
        <Link
          to="/chat"
          id="mobile-nav-chat"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${location.pathname.startsWith('/chat') ? 'text-orange-500' : 'hover:text-slate-200'}`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          </div>
          <span>Mensagens</span>
        </Link>

        {/* Perfil */}
        <Link
          to={getProfileLink()}
          id="mobile-nav-profile"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${location.pathname === getProfileLink() ? 'text-orange-500' : 'hover:text-slate-200'}`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </Link>
      </div>
    </div>
  );
};
