import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Bell, 
  User, 
  Plus, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  Wrench, 
  ChevronDown,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenRequestModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRequestModal, onOpenAuthModal }) => {
  const { currentUser, switchRole, unreadNotificationsCount, openNotifications } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CLIENTE':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">Cliente</span>;
      case 'PROFISSIONAL':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Profissional</span>;
      case 'EMPRESA':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">Empresa</span>;
      case 'ADMIN':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">Admin</span>;
    }
  };

  const getDashboardLink = () => {
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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top micro bar with location and banner */}
      <div className="bg-slate-950/80 px-4 py-1.5 text-xs border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="font-medium text-slate-200">Imperatriz - MA e região</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">Serviços com atendimento rápido e profissionais verificados</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Role Tester switcher */}
            <div className="relative">
              <button
                id="role-switch-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-medium transition"
              >
                <span>Perfil: <strong>{currentUser.role}</strong></span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleMenuOpen && (
                <div 
                  id="role-switch-dropdown"
                  className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Alternar Papel (Modo de Teste)
                  </div>
                  <button
                    onClick={() => { switchRole('CLIENTE'); setRoleMenuOpen(false); navigate('/cliente'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${currentUser.role === 'CLIENTE' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-200 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <div>
                        <div>Lucas Ferreira</div>
                        <div className="text-[10px] text-slate-400">Cliente solicitante</div>
                      </div>
                    </div>
                    {currentUser.role === 'CLIENTE' && <span className="text-orange-400 text-xs">✓ Ativo</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('PROFISSIONAL'); setRoleMenuOpen(false); navigate('/profissional'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${currentUser.role === 'PROFISSIONAL' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-200 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <div>
                        <div>João Silva</div>
                        <div className="text-[10px] text-slate-400">Técnico de Climatização (⭐ 4.9)</div>
                      </div>
                    </div>
                    {currentUser.role === 'PROFISSIONAL' && <span className="text-orange-400 text-xs">✓ Ativo</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('EMPRESA'); setRoleMenuOpen(false); navigate('/empresa'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${currentUser.role === 'EMPRESA' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-200 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <div>ClimaTech Soluções</div>
                        <div className="text-[10px] text-slate-400">Gestão de Equipe e Frotas</div>
                      </div>
                    </div>
                    {currentUser.role === 'EMPRESA' && <span className="text-orange-400 text-xs">✓ Ativo</span>}
                  </button>

                  <button
                    onClick={() => { switchRole('ADMIN'); setRoleMenuOpen(false); navigate('/admin'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${currentUser.role === 'ADMIN' ? 'bg-orange-500/20 text-orange-400 font-semibold' : 'text-slate-200 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      <div>
                        <div>Administrador Geral</div>
                        <div className="text-[10px] text-slate-400">Comissões, Usuários e RLS</div>
                      </div>
                    </div>
                    {currentUser.role === 'ADMIN' && <span className="text-orange-400 text-xs">✓ Ativo</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition">
              {/* Construction helmet shield icon matching the visual reference */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-950 fill-current" stroke="none">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 5a4 4 0 0 1 4 4v1h-8v-1a4 4 0 0 1 4-4zm-5 7h10a1 1 0 0 1 1 1v1H6v-1a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">
                  Quem<span className="text-orange-500">Resolve</span>
                </span>
              </div>
              <p className="text-[10px] font-medium text-orange-400/90 leading-none">
                Você pede. Quem resolve, aparece.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === '/' ? 'text-orange-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              Início
            </Link>
            <Link
              to="/cliente"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === '/cliente' ? 'text-orange-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              Painel Cliente
            </Link>
            <Link
              to="/profissional"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname.startsWith('/profissional') ? 'text-orange-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              Área do Profissional
            </Link>
            <Link
              to="/empresa"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === '/empresa' ? 'text-orange-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              Empresas
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname.startsWith('/admin') ? 'text-orange-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
            >
              Admin
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Primary Action Button: Resolver Algo */}
            <button
              id="cta-request-service-btn"
              onClick={onOpenRequestModal}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/40 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Resolver algo</span>
            </button>

            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={openNotifications}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-orange-500 text-slate-950 text-[10px] font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition border border-slate-700/60"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-lg object-cover border border-orange-500/40"
                />
                <span className="hidden lg:inline text-xs font-semibold text-slate-200">
                  {currentUser.full_name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div 
                  id="user-profile-menu"
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in"
                >
                  <div className="px-3 py-2 border-b border-slate-700/60">
                    <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-200 hover:bg-slate-700 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-400" />
                      <span>Meu Painel ({currentUser.role})</span>
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-200 hover:bg-slate-700 transition"
                    >
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <span>Minhas Mensagens</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-700/60 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-300 hover:bg-slate-700 transition"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Entrar com outra conta</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        switchRole('CLIENTE');
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Reiniciar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
