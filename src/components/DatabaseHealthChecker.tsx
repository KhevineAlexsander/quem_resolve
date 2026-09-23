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
  Zap
} from 'lucide-react';
import { dbHealthService, DbDiagnosticResult } from '../services/dbHealthService';

const SQL_MIGRATION_CODE = `-- ==============================================================================
-- QUEM RESOLVE - ATUALIZAÇÃO DO BANCO DE DADOS SUPABASE (STATUS & LINHA DO TEMPO)
-- ==============================================================================

-- 1. Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Atualiza restrição de status na tabela service_requests
DO $$
BEGIN
    ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
    ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS check_status;
    
    ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_status_check 
    CHECK (status IN (
        'REQUESTED',
        'PROFESSIONALS_NOTIFIED',
        'QUOTE_RECEIVED',
        'PROFESSIONAL_SELECTED',
        'SCHEDULED',
        'ON_THE_WAY',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
        'pending',
        'searching',
        'quotes_received',
        'accepted',
        'professional_on_way',
        'in_progress',
        'completed',
        'cancelled'
    ));
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Tabela service_requests ainda não criada.';
END $$;

-- 3. Adiciona colunas de endereço estruturado em service_requests
DO $$
BEGIN
    ALTER TABLE public.service_requests 
        ADD COLUMN IF NOT EXISTS street TEXT,
        ADD COLUMN IF NOT EXISTS number TEXT,
        ADD COLUMN IF NOT EXISTS neighborhood TEXT,
        ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Imperatriz',
        ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'MA',
        ADD COLUMN IF NOT EXISTS zip_code TEXT,
        ADD COLUMN IF NOT EXISTS complement TEXT,
        ADD COLUMN IF NOT EXISTS reference_point TEXT;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Tabela service_requests inexistente.';
END $$;

-- 4. Cria a tabela de Histórico de Status / Linha do Tempo
CREATE TABLE IF NOT EXISTS public.service_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_req ON public.service_status_history(service_request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON public.service_status_history(created_at);

-- 5. Trigger automático para auditoria de status em tempo real
CREATE OR REPLACE FUNCTION public.handle_service_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.service_status_history (
            service_request_id,
            status,
            changed_by_name,
            notes,
            created_at
        ) VALUES (
            NEW.id,
            NEW.status,
            'Sistema Automático',
            'Transição de status registrada com sucesso',
            now()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_service_status_change ON public.service_requests;
CREATE TRIGGER trg_service_status_change
    AFTER INSERT OR UPDATE OF status ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_service_status_change();

-- 6. Configura Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.service_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem visualizar histórico de status" ON public.service_status_history;
CREATE POLICY "Todos podem visualizar histórico de status"
    ON public.service_status_history FOR SELECT
    TO public, authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir histórico" ON public.service_status_history;
CREATE POLICY "Usuários autenticados podem inserir histórico"
    ON public.service_status_history FOR INSERT
    TO public, authenticated
    WITH CHECK (true);

-- 7. Habilita Realtime no Supabase
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_status_history;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;`;

export const DatabaseHealthChecker: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DbDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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
    checkDatabase();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_CODE);
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
                  Verificador de Banco de Dados
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
                Monitoramento em tempo real da conexão, latência e integridade das tabelas do Supabase.
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
              {diagnostic?.supabaseUrl || 'Pronto para credenciais .env'}
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
              {diagnostic?.connected ? 'Ping HTTP / REST API' : 'Acesso de memória instantâneo'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Chaves de Acesso (API Key)</span>
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white mt-1">
              {diagnostic?.hasAnonKey ? 'Configurada' : 'Não informada'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {diagnostic?.hasAnonKey ? 'VITE_SUPABASE_PUBLISHABLE_KEY OK' : 'Usando fallback local'}
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

        {/* Informative message if in local mode */}
        {diagnostic && !diagnostic.connected && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-3">
            <Server className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-blue-100 font-semibold">Sistema em Operação Contínua:</strong>
              <p className="text-blue-300">
                Seu aplicativo está funcionando perfeitamente com todas as regras, persistência local e dados de Imperatriz - MA. Para sincronizar em tempo real com o banco de dados Supabase na nuvem, adicione as variáveis no seu arquivo de ambiente ou servidor e execute o script SQL abaixo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Tables Verification Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Integridade das Tabelas do Schema
            </h3>
            <p className="text-xs text-slate-400">
              Verificação estrutural das tabelas requeridas pelo sistema e pelo novo fluxo de linha do tempo.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            {diagnostic?.tables.filter(t => t.status === 'ok').length || 0} de {diagnostic?.tables.length || 0} tabelas validadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnostic?.tables.map((table) => (
            <div
              key={table.name}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                table.status === 'ok'
                  ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                  : table.status === 'missing'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-red-950/20 border-red-500/30'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {table.label}
                  </span>
                  {table.name === 'service_status_history' && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 font-extrabold px-1.5 py-0.5 rounded border border-orange-500/30">
                      NOVA ATUALIZAÇÃO
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {table.message || `Tabela pública: ${table.name}`}
                </div>
              </div>

              <div>
                {table.status === 'ok' ? (
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : table.status === 'missing' ? (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400" title="Tabela pendente de criação">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400" title="Erro">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Migration & Instructions Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-white">
                Códigos Necessários para Executar no Supabase
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Script SQL pronto para ser executado no SQL Editor do Supabase para aplicar a nova linha do tempo e campos de endereço.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySql}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script SQL</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Como Executar</span>
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step by step accordion */}
        {showInstructions && (
          <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in-50 text-xs text-slate-300">
            <h4 className="font-bold text-white text-sm">Passo a Passo Rápido no Supabase:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1 leading-relaxed">
              <li>Acesse o painel do seu projeto no Supabase em <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline font-bold inline-flex items-center gap-1">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>No menu lateral esquerdo, clique no ícone do <strong>SQL Editor</strong> (ícone com código <Terminal className="w-3.5 h-3.5 inline text-orange-400" />).</li>
              <li>Clique no botão <strong>+ New query</strong> no topo para abrir um editor limpo.</li>
              <li>Clique no botão <strong>"Copiar Script SQL"</strong> acima e cole no editor do Supabase (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">Ctrl + V</kbd>).</li>
              <li>Clique no botão verde <strong>Run</strong> (ou aperte <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-[10px]">Ctrl + Enter</kbd>).</li>
              <li>Retorne a esta página e clique em <strong>"Testar Conexão Agora"</strong> para ver todas as tabelas em verde com sucesso!</li>
            </ol>
          </div>
        )}

        {/* SQL Code Box with toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-mono text-[11px] text-slate-400">supabase/migrations/20260923_status_timeline_update.sql</span>
            <button
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>{showSqlCode ? 'Recolher código' : 'Expandir e visualizar SQL'}</span>
              {showSqlCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className={`relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs ${showSqlCode ? 'max-h-[500px]' : 'max-h-[220px]'} overflow-y-auto transition-all`}>
            <div className="sticky top-0 right-0 z-10 flex justify-end p-2 bg-slate-950/80 backdrop-blur-sm border-b border-slate-900">
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-orange-400" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-4 pt-1 text-slate-300 whitespace-pre leading-relaxed select-all">
              {SQL_MIGRATION_CODE}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
