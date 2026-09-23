import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RequestServiceModal } from './components/RequestServiceModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';

import { HomePage } from './pages/HomePage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ProfessionalDashboardPage } from './pages/ProfessionalDashboardPage';
import { CompanyDashboardPage } from './pages/CompanyDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ProfessionalProfilePage } from './pages/ProfessionalProfilePage';
import { ServiceTrackingPage } from './pages/ServiceTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MapPin, ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { openRequestModal, openAuthModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        onOpenRequestModal={() => openRequestModal()}
        onOpenAuthModal={openAuthModal}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cliente" element={<ClientDashboardPage />} />
          <Route path="/profissional" element={<ProfessionalDashboardPage />} />
          <Route path="/profissional/:id" element={<ProfessionalProfilePage />} />
          <Route path="/solicitacoes/:id" element={<ServiceTrackingPage />} />
          <Route path="/app/solicitacoes/:id" element={<ServiceTrackingPage />} />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/app/notificacoes" element={<NotificationsPage />} />
          <Route path="/empresa" element={<CompanyDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <RequestServiceModal />
      <AuthModal />
      <NotificationModal />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenRequestModal={() => openRequestModal()} />

      {/* Desktop & Mobile App Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-black text-slate-950">
                  QR
                </div>
                <span className="font-display font-extrabold text-lg text-white">
                  Quem Resolve
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Plataforma de serviços em Imperatriz - MA. Conectando clientes aos melhores técnicos com linha do tempo e acompanhamento em tempo real.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Imperatriz - Maranhão, Brasil</span>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Para Clientes
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/cliente" className="hover:text-orange-400 transition">Meus Pedidos</Link></li>
                <li><Link to="/notificacoes" className="hover:text-orange-400 transition">Notificações</Link></li>
                <li><button onClick={() => openRequestModal()} className="hover:text-orange-400 transition text-left">Solicitar Orçamento</button></li>
                <li><Link to="/chat" className="hover:text-orange-400 transition">Chat com Técnicos</Link></li>
              </ul>
            </div>

            {/* Professionals & Companies */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Para Profissionais
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/profissional" className="hover:text-orange-400 transition">Painel do Profissional</Link></li>
                <li><Link to="/empresa" className="hover:text-orange-400 transition">Painel Empresarial</Link></li>
                <li><Link to="/admin" className="hover:text-orange-400 transition">Painel Administrativo</Link></li>
              </ul>
            </div>

            {/* Trust and safety */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Garantia e Segurança
              </h4>
              <p className="text-slate-400 text-xs">
                Todos os profissionais passam por verificação cadastral. Pagamentos intermediados com segurança.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Protegido</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Quem Resolve - Imperatriz/MA. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Feito com dedicação para a região Tocantina
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
