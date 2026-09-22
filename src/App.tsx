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
                <span className="font-display font-bold text-lg text-white">
                  Quem<span className="text-orange-500">Resolve</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Você pede. Quem resolve, aparece. Plataforma líder em contratação de serviços residenciais, comerciais e manutenção em Imperatriz - MA.
              </p>
              <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Imperatriz - Maranhão • Brasil</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Para Clientes
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => openRequestModal()} className="hover:text-orange-400 transition text-left">
                    Solicitar um Profissional
                  </button>
                </li>
                <li>
                  <Link to="/cliente" className="hover:text-orange-400 transition">
                    Meus Pedidos & Rastreamento
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-orange-400 transition">
                    Mapa de Prestadores
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pros & Companies */}
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Para Parceiros
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/profissional" className="hover:text-orange-400 transition">
                    Área do Profissional
                  </Link>
                </li>
                <li>
                  <Link to="/empresa" className="hover:text-orange-400 transition">
                    Área da Empresa (Frotas e PMOC)
                  </Link>
                </li>
                <li>
                  <button onClick={openAuthModal} className="hover:text-orange-400 transition text-left">
                    Cadastre-se como Prestador
                  </button>
                </li>
              </ul>
            </div>

            {/* Security & Guarantees */}
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Segurança e Suporte
              </h4>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Garantia de 90 Dias</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Todos os serviços contratados pelo Quem Resolve contam com seguro e mediação técnica.
                </p>
                <div className="text-[11px] text-slate-300 font-semibold pt-1">
                  SAC Imperatriz: (99) 3524-0000
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} Quem Resolve Tecnologia Ltda. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Desenvolvido com dedicação para a população de Imperatriz - MA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
