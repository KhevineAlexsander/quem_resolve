import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Wrench, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  MapPin, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CompanyDashboardPage: React.FC = () => {
  const { requests } = useApp();

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'João Silva', role: 'Técnico Sênior', phone: '(99) 98123-4567', status: 'Em atendimento (Juçara)', rating: 4.9 },
    { id: '2', name: 'Marcelo Neves', role: 'Eletrotécnico', phone: '(99) 98456-7890', status: 'Disponível na base', rating: 4.8 },
    { id: '3', name: 'Rafael Dias', role: 'Auxiliar Técnico', phone: '(99) 98222-3344', status: 'A caminho (Centro)', rating: 4.7 },
  ]);

  const [contracts] = useState([
    { id: 'c1', client: 'Hospital e Maternidade São Camilo', type: 'PMOC Climatização Mensal', value: 4500, nextVisit: '25/09/2026' },
    { id: 'c2', client: 'Supermercado Tocantins', type: 'Manutenção de Câmaras Frias', value: 3800, nextVisit: '28/09/2026' },
    { id: 'c3', client: 'Hotel Imperatriz Plaza', type: 'Revisão Elétrica e Ar-Condicionado', value: 6200, nextVisit: '02/10/2026' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Company Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold text-2xl">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-white">
                  ClimaTech Soluções de Climatização Ltda
                </h1>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  CNPJ Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                CNPJ: 34.567.890/0001-12 • Imperatriz - MA (Juçara) • Gestão Centralizada
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                <span>⭐ 4.9 de reputação corporativa</span>
                <span>•</span>
                <span>3 técnicos ativos no campo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
              <Plus className="w-4 h-4" />
              <span>Novo Técnico</span>
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs transition shadow flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Novo Contrato B2B</span>
            </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-medium">Faturamento Mensal</div>
            <div className="text-2xl font-extrabold text-white mt-2">R$ 24.500,00</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% este mês
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-medium">Contratos PMOC Ativos</div>
            <div className="text-2xl font-extrabold text-purple-400 mt-2">12 empresas</div>
            <div className="text-[11px] text-slate-400 mt-1">Receita recorrente garantida</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-medium">Ordens de Serviço no Mês</div>
            <div className="text-2xl font-extrabold text-white mt-2">64 atendimentos</div>
            <div className="text-[11px] text-blue-400 mt-1">Tempo médio de resposta: 22 min</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-medium">Taxa de Conclusão</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">99.2%</div>
            <div className="text-[11px] text-slate-400 mt-1">Zero reclamações abertas</div>
          </div>
        </div>

        {/* Team Dispatch Section (Prompt Section 21) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Team Members List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Equipe Técnica e Frota em Campo
              </h2>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-orange-400">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{member.name}</span>
                        <span className="text-amber-400 text-[10px]">★ {member.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{member.role}</p>
                      <div className="text-[10px] text-emerald-400 mt-0.5">{member.status}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${member.phone}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Ligar para o técnico"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B2B Contracts & Recurring Clients (Prompt Section 22) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Contratos Corporativos em Imperatriz
              </h2>
            </div>

            <div className="space-y-3">
              {contracts.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-bold text-xs text-white">{item.client}</h3>
                    <p className="text-[11px] text-slate-400">{item.type}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Próxima manutenção agendada: {item.nextVisit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400 block">
                      R$ {item.value.toLocaleString('pt-BR')}/mês
                    </span>
                    <span className="text-[10px] text-slate-400">Contrato Anual</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
