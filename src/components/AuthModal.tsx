import React, { useState } from 'react';
import { X, User, Wrench, Building2, ShieldCheck, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, switchRole, refreshData } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('CLIENTE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isRegister) {
        await authService.register({
          fullName,
          email,
          phone,
          role,
          password,
        });
      } else {
        await authService.login(email, password);
      }
      refreshData();
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha na autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (targetRole: UserRole) => {
    switchRole(targetRole);
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-100">
              {isRegister ? 'Criar nova conta' : 'Acessar o Quem Resolve'}
            </h3>
            <p className="text-xs text-orange-400">
              Você pede. Quem resolve, aparece.
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Access Bar */}
          <div className="mb-5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Demonstração Imediata (1-Clique):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('CLIENTE')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 flex items-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Cliente (Lucas)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('PROFISSIONAL')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 flex items-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Profissional (João)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('EMPRESA')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-400 flex items-center gap-1.5 transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Empresa (ClimaTech)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-red-400 flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrador</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <>
                {/* User Type Question (Prompt Section 4) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Como você quer usar o Quem Resolve?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('CLIENTE')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        role === 'CLIENTE'
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <div className="text-[11px] font-bold">Preciso de um serviço</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('PROFISSIONAL')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        role === 'PROFISSIONAL'
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Wrench className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                      <div className="text-[11px] font-bold">Quero prestar serviços</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('EMPRESA')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        role === 'EMPRESA'
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <div className="text-[11px] font-bold">Tenho uma empresa</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefone (WhatsApp):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(99) 98000-0000"
                      className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Carregando...' : isRegister ? 'Concluir Cadastro' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-orange-400 hover:underline"
            >
              {isRegister
                ? 'Já possui uma conta? Faça login aqui'
                : 'Não tem conta ainda? Cadastre-se gratuitamente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
