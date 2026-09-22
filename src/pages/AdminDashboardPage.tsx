import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Wrench, 
  DollarSign, 
  Settings, 
  Check, 
  X, 
  Sliders, 
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { paymentService } from '../services/paymentService';

export const AdminDashboardPage: React.FC = () => {
  const { professionals, categories, requests, refreshData } = useApp();
  const [feePercentage, setFeePercentage] = useState(paymentService.getFeePercentage());
  const [savedFee, setSavedFee] = useState(false);

  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'pv-1',
      name: 'Carlos Oliveira',
      category: 'Hidráulica e Encanamento',
      document: 'MEI: 45.123.987/0001-55 • CNH B',
      status: 'pending',
    },
    {
      id: 'pv-2',
      name: 'Ana Paula Souza',
      category: 'Higienização e Estofados',
      document: 'RG: 03459812-MA • Certificado Senai',
      status: 'pending',
    },
  ]);

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    paymentService.setFeePercentage(feePercentage);
    setSavedFee(true);
    setTimeout(() => setSavedFee(false), 2000);
  };

  const handleApprovePro = (id: string) => {
    setPendingVerifications(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-white">
                Painel Administrativo
              </h1>
              <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Controle geral da plataforma Quem Resolve em Imperatriz - MA.
            </p>
          </div>
        </div>

        {/* Global KPIs (Prompt Section 26) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Volume Total Transacionado</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">R$ 142.800,00</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 245 serviços concluídos
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Receita de Comissões ({feePercentage}%)</span>
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-orange-400 mt-2">R$ 14.280,00</div>
            <div className="text-[11px] text-slate-400 mt-1">Retido automaticamente</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Profissionais Ativos</span>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{professionals.length + 38} ativos</div>
            <div className="text-[11px] text-slate-400 mt-1">Imperatriz e região</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fila de Verificação</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-2">{pendingVerifications.length} pendentes</div>
            <div className="text-[11px] text-slate-400 mt-1">Aguardando auditoria documental</div>
          </div>
        </div>

        {/* Two Columns: Commission Rate Settings & Verification Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Commission settings (Prompt Section 27) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-400" />
              <h2 className="font-bold text-base text-white">
                Comissão da Plataforma (%)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Percentual descontado dos repasses dos profissionais autônomos e empresas parceiras.
            </p>

            <form onSubmit={handleSaveFee} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Taxa atual:</span>
                  <span className="text-orange-400 text-base">{feePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Mínimo: 5%</span>
                  <span>Padrão de mercado: 10% - 15%</span>
                  <span>Máximo: 25%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Em um serviço de R$ 200,00:</span>
                </div>
                <div className="flex justify-between text-white font-semibold">
                  <span>Repasse ao profissional:</span>
                  <span>R$ {(200 * (1 - feePercentage / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-400 font-bold">
                  <span>Receita Quem Resolve:</span>
                  <span>R$ {(200 * (feePercentage / 100)).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow"
              >
                {savedFee ? '✓ Taxa Atualizada com Sucesso!' : 'Salvar Nova Taxa'}
              </button>
            </form>
          </div>

          {/* Pending Verifications Queue */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-white">
                  Fila de Aprovação de Profissionais
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Auditoria de segurança Quem Resolve
              </span>
            </div>

            {pendingVerifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Todos os prestadores estão verificados no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-normal">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.document}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleApprovePro(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar Selo</span>
                      </button>
                      <button
                        onClick={() => handleApprovePro(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
