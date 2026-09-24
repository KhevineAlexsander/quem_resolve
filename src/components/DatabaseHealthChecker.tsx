import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Layers, 
  Clock, 
  Key, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Terminal,
  Zap,
  UploadCloud,
  DownloadCloud,
  Globe,
  CheckCircle,
  Save,
  Trash2,
  Play
} from 'lucide-react';
import { dbHealthService, DbDiagnosticResult } from '../services/dbHealthService';
import { supabaseSyncService, SyncReport } from '../services/supabaseSyncService';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  isSupabaseConfigured 
} from '../lib/supabase';

const MASTER_SQL_SCRIPT = `-- ==============================================================================
-- QUEM RESOLVE - SCHEMA COMPLETO E DEFINITIVO PARA O SUPABASE (COMPATIBILIDADE TOTAL)
-- Execute este script no SQL Editor do seu projeto Supabase para habilitar 
-- gravações e atualizações em tempo real sem bloqueios de RLS ou incompatibilidade de ID.
-- ==============================================================================

-- 1. Habilita Extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Categorias (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'grid',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- 4. Tabela de Profissionais (professionals)
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    profile_id TEXT,
    bio TEXT,
    document_status TEXT DEFAULT 'approved',
    verification_status TEXT DEFAULT 'verified',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    total_services INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    latitude DOUBLE PRECISION DEFAULT -5.5266,
    longitude DOUBLE PRECISION DEFAULT -47.4797,
    service_radius_km NUMERIC(5, 2) DEFAULT 25.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Solicitações de Serviço (service_requests)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    client_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'REQUESTED',
    scheduled_date DATE,
    scheduled_start TIME,
    scheduled_end TIME,
    address TEXT NOT NULL,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Imperatriz',
    state TEXT DEFAULT 'MA',
    zip_code TEXT,
    complement TEXT,
    reference_point TEXT,
    latitude DOUBLE PRECISION DEFAULT -5.5266,
    longitude DOUBLE PRECISION DEFAULT -47.4797,
    urgency TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Histórico de Status / Linha do Tempo (service_status_history)
CREATE TABLE IF NOT EXISTS public.service_status_history (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    service_request_id TEXT NOT NULL,
    status TEXT NOT NULL,
    changed_by TEXT,
    changed_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Orçamentos (quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    service_request_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    estimated_duration TEXT,
    available_date DATE,
    available_time TIME,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Mensagens de Chat (messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabela de Notificações (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Avaliações (reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    service_request_id TEXT,
    client_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabela de Configurações da Plataforma (platform_settings)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 12. POLÍTICAS DE ACESSO LIVRE (RLS PERMISSIVO PARA O APP COM CHAVE ANON)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 
        'categories', 
        'professionals', 
        'service_requests', 
        'service_status_history', 
        'quotes', 
        'messages', 
        'notifications', 
        'reviews', 
        'platform_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "permitir_tudo_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "permitir_tudo_%s" ON public.%I FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 13. HABILITAÇÃO DO SUPABASE REALTIME EM TODAS AS TABELAS
-- ==============================================================================
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'service_requests', 
        'service_status_history', 
        'quotes', 
        'messages', 
        'notifications', 
        'reviews',
        'professionals'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION WHEN duplicate_object THEN 
            NULL;
        WHEN undefined_object THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ==============================================================================
-- 14. SEED INICIAL (CATEGORIAS E CONFIGURAÇÕES DE IMPERATRIZ - MA)
-- ==============================================================================
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('platform_fee_percentage', '10', 'Taxa percentual de intermediação'),
    ('city_name', 'Imperatriz - MA', 'Cidade Polo Principal'),
    ('support_phone', '(99) 98123-4567', 'Canal oficial de suporte')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.categories (id, name, slug, description, icon, is_active)
VALUES
    ('cat-climatizacao', 'Climatização', 'climatizacao', 'Instalação, limpeza e conserto de ar-condicionado e split', 'snowflake', true),
    ('cat-eletrica', 'Elétrica', 'eletrica', 'Instalações elétricas, tomadas, quadros de luz e chuveiros', 'zap', true),
    ('cat-hidraulica', 'Hidráulica', 'hidraulica', 'Desentupimentos, vazamentos, torneiras e encanamentos', 'droplet', true),
    ('cat-limpeza', 'Limpeza', 'limpeza', 'Faxina residencial, pós-obra, estofados e comercial', 'sparkles', true),
    ('cat-construcao', 'Construção', 'construcao', 'Pedreiro, reformas, pisos, azulejos e alvenaria', 'hard-hat', true),
    ('cat-pintura', 'Pintura', 'pintura', 'Pintura residencial, texturas, fachadas e vernizes', 'paint-roller', true),
    ('cat-automotivo', 'Automotivo', 'automotivo', 'Mecânica rápida, socorro 24h, bateria e ar automotivo', 'wrench', true),
    ('cat-tecnologia', 'Tecnologia', 'tecnologia', 'Manutenção de computadores, celulares, redes Wi-Fi e câmeras', 'laptop', true),
    ('cat-montagem', 'Montagem', 'montagem', 'Montagem e desmontagem de móveis e painéis', 'tool', true),
    ('cat-outros', 'Outros', 'outros', 'Pequenos reparos, chaveiro, carretos e jardinagem', 'grid', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

SELECT 'Configuração do Supabase concluída com sucesso!' AS resultado, now() AS horario;`;

export const DatabaseHealthChecker: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DbDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Credenciais form
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Sincronização e teste de escrita
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
  const [testingWrite, setTestingWrite] = useState(false);
  const [testWriteResult, setTestWriteResult] = useState<{ success: boolean; message: string; durationMs: number } | null>(null);
  const [pullingAll, setPullingAll] = useState(false);
  const [pullResultMsg, setPullResultMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [showVercelGuide, setShowVercelGuide] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const res = await dbHealthService.runDiagnostic();
      setDiagnostic(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setInputUrl(creds.url || '');
    setInputKey(creds.key || '');
    checkDatabase();
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const res = saveSupabaseCredentials(inputUrl, inputKey);
    if (res.success) {
      setSaveSuccessMsg('Credenciais salvas com sucesso! Conectando ao Supabase e sincronizando dados...');
      supabaseSyncService.pullAllFromSupabase().catch(() => {});
      supabaseSyncService.setupRealtime();
      setTimeout(() => {
        setSaveSuccessMsg('');
        checkDatabase();
      }, 1500);
    } else {
      setSaveErrorMsg(res.error || 'Erro ao validar credenciais');
    }
  };

  const handleClearCredentials = () => {
    if (confirm('Deseja remover as credenciais salvas e voltar ao modo padrão?')) {
      clearSupabaseCredentials();
      setInputUrl('');
      setInputKey('');
      setSaveSuccessMsg('Credenciais removidas. Modo local ativo.');
      setTimeout(() => {
        setSaveSuccessMsg('');
        checkDatabase();
      }, 1500);
    }
  };

  const handlePullAllData = async () => {
    setPullingAll(true);
    setPullResultMsg(null);
    try {
      const res = await supabaseSyncService.pullAllFromSupabase();
      if (res.success) {
        const total = Object.values(res.loadedCounts || {}).reduce((a, b) => a + b, 0);
        setPullResultMsg({
          success: true,
          text: `Sincronização concluída! ${total} registros recuperados do Supabase com sucesso.`,
        });
        await checkDatabase();
      } else {
        setPullResultMsg({
          success: false,
          text: `Falha ao carregar dados: ${res.error || 'Verifique as credenciais e o SQL Editor.'}`,
        });
      }
    } finally {
      setPullingAll(false);
    }
  };

  const handlePushAllData = async () => {
    setSyncingAll(true);
    setSyncReport(null);
    try {
      const report = await supabaseSyncService.pushAllLocalToSupabase();
      setSyncReport(report);
      await checkDatabase();
    } finally {
      setSyncingAll(false);
    }
  };

  const handleTestWrite = async () => {
    setTestingWrite(true);
    setTestWriteResult(null);
    try {
      const result = await supabaseSyncService.testDirectWrite();
      setTestWriteResult(result);
      await checkDatabase();
    } finally {
      setTestingWrite(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(MASTER_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Health Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              diagnostic?.connected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : diagnostic?.isConfigured
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Verificador de Banco de Dados & Supabase
                </h2>
                {diagnostic?.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Conectado
                  </span>
                ) : diagnostic?.isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Atenção na Conexão
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Modo LocalStorage Ativo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Monitoramento, sincronização de dados e testes de gravação em tempo real no Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkDatabase}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Verificando...' : 'Testar Conexão Agora'}</span>
            </button>
          </div>
        </div>

        {/* KPIs bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Status do Provedor</span>
              <Server className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              {diagnostic?.connected ? 'Supabase Cloud (PostgreSQL)' : diagnostic?.isConfigured ? 'Supabase com Alerta' : 'Armazenamento Local'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {diagnostic?.supabaseUrl || 'Configurável abaixo'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Latência de Resposta</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              {diagnostic?.latencyMs !== null ? `${diagnostic?.latencyMs} ms` : 'Ultra Rápido (<1ms)'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {diagnostic?.connected ? 'Ping HTTP / REST API' : 'Acesso de memória local'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Origem das Chaves</span>
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              {diagnostic?.credentialSource === 'custom' ? 'Configurado no Painel' : diagnostic?.credentialSource === 'env' ? 'Variável .env' : 'Não informada'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {diagnostic?.hasAnonKey ? 'Anon Public Key OK' : 'Usando fallback local'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Última Verificação</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              {diagnostic?.checkedAt || '--:--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Horário do navegador
            </div>
          </div>
        </div>

        {/* Action Panel: Test Write and Sync All */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-orange-400" />
                Sincronização & Teste de Gravação Imediata
              </h4>
              <p className="text-xs text-slate-400">
                Teste se as alterações estão gravando no Supabase ou envie todos os dados existentes de uma só vez.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleTestWrite}
                disabled={testingWrite}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 text-emerald-400 ${testingWrite ? 'animate-spin' : ''}`} />
                <span>{testingWrite ? 'Testando...' : 'Testar Gravação'}</span>
              </button>
              <button
                onClick={handlePullAllData}
                disabled={pullingAll}
                className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <DownloadCloud className={`w-3.5 h-3.5 ${pullingAll ? 'animate-bounce' : ''}`} />
                <span>{pullingAll ? 'Baixando...' : 'Baixar Dados do Supabase'}</span>
              </button>
              <button
                onClick={handlePushAllData}
                disabled={syncingAll}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/20"
              >
                <UploadCloud className={`w-4 h-4 ${syncingAll ? 'animate-bounce' : ''}`} />
                <span>{syncingAll ? 'Enviando tudo...' : 'Enviar Dados para o Supabase'}</span>
              </button>
            </div>
          </div>

          {/* Pull Result Feedback */}
          {pullResultMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              pullResultMsg.success 
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {pullResultMsg.success ? <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              <div>
                <strong>{pullResultMsg.success ? 'Dados Baixados:' : 'Aviso:'}</strong> {pullResultMsg.text}
              </div>
            </div>
          )}

          {/* Test Write Feedback */}
          {testWriteResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              testWriteResult.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {testWriteResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              <div>
                <strong>{testWriteResult.success ? 'Gravação Confirmada:' : 'Falha no Teste:'}</strong> {testWriteResult.message} ({testWriteResult.durationMs}ms)
              </div>
            </div>
          )}

          {/* Sync Report Feedback */}
          {syncReport && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Relatório de Sincronização ({syncReport.totalSynced} registros processados)
                </span>
                <span className="text-slate-400 text-[11px]">{new Date(syncReport.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {Object.entries(syncReport.tables).map(([table, res]) => (
                  <div key={table} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px]">
                    <span className="font-mono text-slate-300 font-bold block truncate">{table}</span>
                    {res.failed === 0 ? (
                      <span className="text-emerald-400 font-semibold">{res.success} salvos OK</span>
                    ) : (
                      <span className="text-rose-400 font-semibold" title={res.error}>Erro: {res.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credential Form: Configure Directly in App */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-400" />
              Configurar Credenciais do Supabase
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conecte seu projeto Supabase colando a Project URL e a chave pública anon aqui.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase Project URL (ex: https://xxxxxxxxxxxx.supabase.co)
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase Anon / Publishable Key (chave pública do cliente)
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              * Localize essas chaves em: <strong>Supabase Dashboard &gt; Project Settings &gt; API</strong>
            </span>
            <div className="flex items-center gap-2">
              {getSupabaseCredentials().source === 'custom' && (
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-orange-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar e Conectar</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Grid: Tables Verification Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Integridade das Tabelas do Schema Supabase
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validação das tabelas essenciais para o fluxo de serviços, orçamentos, chat e avaliações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {diagnostic?.tables.map((table) => (
            <div 
              key={table.name}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  table.status === 'ok' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : table.status === 'missing'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {table.status === 'ok' && <CheckCircle2 className="w-4 h-4" />}
                  {table.status === 'missing' && <AlertTriangle className="w-4 h-4" />}
                  {table.status === 'error' && <XCircle className="w-4 h-4" />}
                  {table.status === 'not_tested' && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate font-mono">
                    {table.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {table.message || (table.status === 'ok' ? 'Ativo e sincronizado' : 'Status pendente')}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                {table.count !== undefined && (
                  <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 font-mono">
                    {table.count} linhas
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Migration Script Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              Script SQL Definitivo do Supabase
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Copie e execute o código abaixo no SQL Editor do Supabase para criar todas as tabelas, liberar permissões RLS e ativar o Realtime.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySql}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                copiedSql 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'bg-orange-500 hover:bg-orange-600 text-slate-950 shadow-lg shadow-orange-500/20'
              }`}
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar SQL Completo</span>
                </>
              )}
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-slate-700"
            >
              <span>Abrir Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Step-by-Step Instructions Collapsible */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-orange-400">
              <CheckCircle2 className="w-4 h-4" />
              Guia Passo a Passo: Como executar no Supabase (4 passos rápidos)
            </span>
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showInstructions && (
            <div className="p-5 pt-2 border-t border-slate-800/80 space-y-3 text-xs text-slate-300">
              <ol className="list-decimal list-inside space-y-2.5">
                <li>
                  Acesse o painel do seu projeto no Supabase em{' '}
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-orange-400 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    supabase.com/dashboard <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>No menu lateral esquerdo, clique no ícone <strong>SQL Editor</strong> (ícone de terminal <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">&gt;_</kbd>).</li>
                <li>Clique no botão <strong>+ New query</strong>.</li>
                <li>Cole o código SQL (clicando no botão laranja <strong>Copiar SQL Completo</strong> acima) e clique em <strong>Run</strong> (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl + Enter</kbd>).</li>
              </ol>
            </div>
          )}
        </div>

        {/* Vercel Deployment & Connection Guide */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
          <button
            onClick={() => setShowVercelGuide(!showVercelGuide)}
            className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2 text-cyan-400">
              <Globe className="w-4 h-4" />
              Como Conectar via Vercel (Variáveis de Ambiente & Deploy)
            </span>
            {showVercelGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showVercelGuide && (
            <div className="p-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs text-slate-300">
              <p className="text-slate-400">
                Para que sua aplicação hospedada na Vercel conecte automaticamente ao Supabase sem depender do LocalStorage do navegador, adicione as variáveis de ambiente no painel da Vercel:
              </p>
              <div className="space-y-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white text-[11px] block">1. Abra seu Projeto na Vercel:</span>
                  <p className="text-slate-400 text-[11px]">
                    Acesse <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">vercel.com/dashboard <ExternalLink className="w-3 h-3" /></a> e selecione o projeto do Quem Resolve.
                  </p>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-[11px] block">2. Vá em Settings &gt; Environment Variables e adicione:</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span><strong className="text-orange-400">Key:</strong> VITE_SUPABASE_URL</span>
                      <span className="text-slate-400 text-[10px]">(Ex: https://xyzcompany.supabase.co)</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span><strong className="text-orange-400">Key:</strong> VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-slate-400 text-[10px]">(Sua anon / public key do Supabase)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white text-[11px] block">3. Faça o Redeploy na Vercel:</span>
                  <p className="text-slate-400 text-[11px]">
                    Vá na aba <strong>Deployments</strong>, clique nos três pontinhos (<kbd className="px-1 bg-slate-800 rounded">···</kbd>) do último deploy e selecione <strong>Redeploy</strong>.
                  </p>
                  <p className="text-emerald-400 text-[11px] font-semibold">
                    ✓ O Vite compilará as variáveis e sua aplicação na Vercel estará 100% conectada ao Supabase!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Snippet Box */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="font-mono text-[11px] text-slate-400 ml-2">supabase/schema_master_fix.sql</span>
            </div>
            <button
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              {showSqlCode ? 'Recolher Código' : 'Expandir Código'}
              {showSqlCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className={`p-4 font-mono text-[11px] text-slate-300 overflow-x-auto ${showSqlCode ? 'max-h-[500px]' : 'max-h-[160px]'} transition-all`}>
            <pre className="text-slate-300">
              <code>{MASTER_SQL_SCRIPT}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
