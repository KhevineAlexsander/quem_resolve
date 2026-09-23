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
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  FolderTree,
  Building2,
  UserCheck,
  Mail,
  Phone,
  Layers,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { paymentService } from '../services/paymentService';
import { appStore } from '../lib/store';
import { INITIAL_PROFILES } from '../lib/initialData';
import { DatabaseHealthChecker } from '../components/DatabaseHealthChecker';

export const AdminDashboardPage: React.FC = () => {
  const { professionals, categories, requests, currentUser, refreshData } = useApp();
  const [feePercentage, setFeePercentage] = useState(paymentService.getFeePercentage());
  const [savedFee, setSavedFee] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'categories' | 'users' | 'finance' | 'database'>('audit');

  // Category modal state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

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
    {
      id: 'pv-3',
      name: 'Rodrigo Martins',
      category: 'Eletrotécnica e Padrão CEMAR',
      document: 'CFT/CRT: 984512-MA • NR-10 Ativa',
      status: 'pending',
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    paymentService.setFeePercentage(feePercentage);
    setSavedFee(true);
    showToast(`Taxa da plataforma atualizada para ${feePercentage}%!`);
    setTimeout(() => setSavedFee(false), 2000);
  };

  const handleApprovePro = (id: string, name: string) => {
    setPendingVerifications(prev => prev.filter(p => p.id !== id));
    showToast(`Profissional ${name} aprovado com selo verificado!`);
  };

  const handleRejectPro = (id: string, name: string) => {
    setPendingVerifications(prev => prev.filter(p => p.id !== id));
    showToast(`Cadastro de ${name} reprovado com notificação.`);
  };

  const handleToggleCategory = (catId: string) => {
    appStore.toggleCategoryActive(catId);
    refreshData();
    showToast('Status da categoria atualizado!');
  };

  const handleDeleteCategory = (catId: string) => {
    appStore.deleteCategory(catId);
    refreshData();
    showToast('Categoria removida.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-');
    appStore.addCategory({
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || `Serviços especializados de ${newCatName}`,
      icon: 'tool',
      is_active: true,
    });
    setNewCatName('');
    setNewCatSlug('');
    setNewCatDesc('');
    setShowAddCatModal(false);
    refreshData();
    showToast('Nova categoria criada com sucesso!');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja redefinir todo o banco de dados e estado para o padrão limpo de Imperatriz - MA?')) {
      appStore.resetToCleanInitialData();
      refreshData();
      showToast('Dados restaurados para o padrão limpo com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-orange-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Master Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Painel de Controle Master
                </h1>
                <span className="text-xs bg-red-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ADM Master
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Logado como: <strong className="text-white">Khevine Oliveira</strong> (<span className="text-red-300">khevineoliveira@gmail.com</span>) • Gestão Imperatriz - MA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                activeTab === 'database'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Verificar integridade do banco de dados e Supabase"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Status do Banco</span>
            </button>
            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
              title="Restaura os dados iniciais do zero"
            >
              <RefreshCw className="w-4 h-4 text-orange-400" />
              <span>Limpar / Restaurar Dados</span>
            </button>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </div>

        {/* Global KPIs (Prompt Section 26) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Volume Total Transacionado</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">R$ 142.800,00</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 245 serviços concluídos
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Receita de Comissões ({feePercentage}%)</span>
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-orange-400 mt-2">R$ 14.280,00</div>
            <div className="text-[11px] text-slate-400 mt-1">Retido automaticamente</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Profissionais Ativos</span>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{professionals.length + 38} ativos</div>
            <div className="text-[11px] text-slate-400 mt-1">Imperatriz e região</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fila de Auditoria</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-2">{pendingVerifications.length} pendentes</div>
            <div className="text-[11px] text-slate-400 mt-1">Aguardando aprovação</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Auditoria Documental ({pendingVerifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categorias & Serviços ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Diretório de Usuários</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'finance'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Taxas & Finanças</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'database'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Dados & Supabase</span>
          </button>
        </div>

        {/* Tab 1: Audit Queue */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-white">
                  Fila de Aprovação de Prestadores de Serviço
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verificação de antecedentes, MEI, CNH e certificações técnicas para emissão do selo verificado.
                </p>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl">
                {pendingVerifications.length} aguardando
              </span>
            </div>

            {pendingVerifications.length === 0 ? (
              <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="text-3xl">🎉</div>
                <h3 className="font-bold text-slate-200 text-sm">Fila zerada!</h3>
                <p className="text-xs text-slate-400">Todos os prestadores cadastrados foram auditados e verificados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                        <span>{item.name}</span>
                        <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{item.document}</p>
                      <p className="text-[11px] text-slate-500">Localização: Imperatriz - MA • Documentos enviados há 2 horas</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        onClick={() => handleApprovePro(item.id, item.name)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Aprovar Selo</span>
                      </button>
                      <button
                        onClick={() => handleRejectPro(item.id, item.name)}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Categories Management */}
        {activeTab === 'categories' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg text-white">
                  Categorias de Serviços Cadastradas
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controle a visibilidade no aplicativo e adicione novas categorias conforme demanda.
                </p>
              </div>
              <button
                onClick={() => setShowAddCatModal(true)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar Categoria</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    cat.is_active
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/50 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-white block">{cat.name}</span>
                      <span className="text-[11px] text-orange-400 font-mono">slug: {cat.slug}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.is_active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{cat.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className="text-slate-300 hover:text-white font-medium underline"
                    >
                      {cat.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Users Directory */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-white">
              Diretório de Contas e Perfis
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Usuário</th>
                    <th className="pb-3 px-3">E-mail</th>
                    <th className="pb-3 px-3">Telefone</th>
                    <th className="pb-3 px-3">Papel</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {INITIAL_PROFILES.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <img
                          src={p.avatar_url}
                          alt={p.full_name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <span>{p.full_name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{p.email}</td>
                      <td className="py-3 px-3 text-slate-400">{p.phone || '(99) 98452-1100'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.role === 'ADMIN'
                              ? 'bg-red-500/20 text-red-400'
                              : p.role === 'EMPRESA'
                              ? 'bg-purple-500/20 text-purple-400'
                              : p.role === 'PROFISSIONAL'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">Ativo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Financial Settings */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-400" />
                <h2 className="font-bold text-base text-white">
                  Comissão da Plataforma (%)
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Percentual retido automaticamente dos pagamentos realizados via Pix, Cartão ou Boleto em Imperatriz.
              </p>

              <form onSubmit={handleSaveFee} className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">Taxa configurada:</span>
                    <span className="text-orange-400 text-lg font-extrabold">{feePercentage}%</span>
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
                    <span>Padrão do setor: 10% - 15%</span>
                    <span>Máximo: 25%</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="text-slate-400 font-semibold">Simulação de cálculo automático:</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Serviço Exemplo:</span>
                    <span>R$ 250,00</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold">
                    <span>Repasse ao profissional ({(100 - feePercentage).toFixed(1)}%):</span>
                    <span className="text-emerald-400">R$ {(250 * (1 - feePercentage / 100)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-400 font-bold border-t border-slate-800 pt-1.5">
                    <span>Retenção Quem Resolve ({feePercentage}%):</span>
                    <span>R$ {(250 * (feePercentage / 100)).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  {savedFee ? '✓ Taxa Atualizada com Sucesso!' : 'Salvar Configuração de Comissão'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-white">
                  Métodos de Liquidação Suportados
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Garantia e custódia de pagamentos com liberação após confirmação de conclusão do serviço pelo cliente.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Pix Instantâneo (Banco Central)</span>
                    <span className="text-[11px] text-slate-400">Liquidação imediata com chave dinâmica e QR Code</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl">Ativo</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Cartão de Crédito (em até 12x)</span>
                    <span className="text-[11px] text-slate-400">Split de pagamento automático na operadora</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl">Ativo</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Garantia Quem Resolve de 90 dias</span>
                    <span className="text-[11px] text-slate-400">Fundo de segurança contra danos e refações</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Database Health Checker & Supabase Tools */}
        {activeTab === 'database' && (
          <DatabaseHealthChecker />
        )}

        {/* Modal Add Category */}
        {showAddCatModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">Criar Nova Categoria</h3>
                <button
                  onClick={() => setShowAddCatModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome da Categoria:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Serralheria e Portões"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: serralheria"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descrição:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Fabricação, solda e reparos em portões e estruturas metálicas"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCatModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 text-xs font-bold hover:bg-orange-600"
                  >
                    Cadastrar Categoria
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
