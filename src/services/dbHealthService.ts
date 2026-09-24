import { getSupabase, isSupabaseConfigured, getSupabaseCredentials } from '../lib/supabase';

export interface TableHealth {
  name: string;
  label: string;
  status: 'ok' | 'missing' | 'error' | 'not_tested';
  message?: string;
  count?: number;
}

export interface DbDiagnosticResult {
  isConfigured: boolean;
  connected: boolean;
  latencyMs: number | null;
  supabaseUrl: string | null;
  credentialSource: 'env' | 'custom' | 'none';
  hasAnonKey: boolean;
  checkedAt: string;
  tables: TableHealth[];
  error?: string;
}

export const dbHealthService = {
  getMaskedUrl(): string | null {
    const { url } = getSupabaseCredentials();
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}`;
    } catch {
      return url.length > 15 ? url.substring(0, 15) + '...' : url;
    }
  },

  async runDiagnostic(): Promise<DbDiagnosticResult> {
    const startTime = performance.now();
    const { url, key, source } = getSupabaseCredentials();
    const configured = isSupabaseConfigured();
    const client = getSupabase();

    const initialTables: TableHealth[] = [
      { name: 'profiles', label: 'Perfis de Usuários (profiles)', status: 'not_tested' },
      { name: 'service_requests', label: 'Solicitações de Serviço (service_requests)', status: 'not_tested' },
      { name: 'service_status_history', label: 'Histórico de Linha do Tempo (service_status_history)', status: 'not_tested' },
      { name: 'quotes', label: 'Orçamentos (quotes)', status: 'not_tested' },
      { name: 'professionals', label: 'Profissionais (professionals)', status: 'not_tested' },
      { name: 'categories', label: 'Categorias (categories)', status: 'not_tested' },
      { name: 'messages', label: 'Mensagens / Chat (messages)', status: 'not_tested' },
      { name: 'reviews', label: 'Avaliações (reviews)', status: 'not_tested' },
      { name: 'notifications', label: 'Notificações (notifications)', status: 'not_tested' },
      { name: 'platform_settings', label: 'Configurações (platform_settings)', status: 'not_tested' },
    ];

    if (!configured || !client) {
      return {
        isConfigured: false,
        connected: false,
        latencyMs: null,
        supabaseUrl: this.getMaskedUrl(),
        credentialSource: source,
        hasAnonKey: key.length > 20,
        checkedAt: new Date().toLocaleTimeString('pt-BR'),
        tables: initialTables.map(t => ({
          ...t,
          status: 'ok',
          message: 'Ativo em modo LocalStorage (Pronto para sincronizar)',
        })),
        error: 'Chaves do Supabase não configuradas no ambiente nem no painel. A aplicação está funcionando em modo local.',
      };
    }

    try {
      // 1. Testa conectividade básica (ping leve)
      const { data: pingData, error: pingError } = await client
        .from('platform_settings')
        .select('key', { count: 'exact', head: true });

      const latency = Math.round(performance.now() - startTime);

      // Se der erro 42P01 (relação não existe), o servidor respondeu, o que prova conexão com o Supabase!
      const isConnectionOk = !pingError || pingError.code === '42P01' || pingError.code === 'PGRST116';

      if (!isConnectionOk) {
        return {
          isConfigured: true,
          connected: false,
          latencyMs: latency,
          supabaseUrl: this.getMaskedUrl(),
          credentialSource: source,
          hasAnonKey: key.length > 20,
          checkedAt: new Date().toLocaleTimeString('pt-BR'),
          tables: initialTables.map(t => ({ ...t, status: 'error', message: pingError.message })),
          error: `Falha na autenticação ou rede do Supabase: ${pingError.message} (Código: ${pingError.code || 'Desconhecido'})`,
        };
      }

      // 2. Testa cada tabela individualmente
      const tablesResults: TableHealth[] = await Promise.all(
        initialTables.map(async (table) => {
          try {
            const { count: tCount, error: tError } = await client
              .from(table.name)
              .select('*', { count: 'exact', head: true });

            if (tError) {
              if (tError.code === '42P01') {
                return {
                  ...table,
                  status: 'missing',
                  message: 'Tabela ausente no Supabase. Execute o script SQL no Supabase SQL Editor.',
                };
              }
              if (tError.code === '42501') {
                return {
                  ...table,
                  status: 'error',
                  message: 'Acesso bloqueado por RLS. Execute o script SQL para liberar permissões da anon key.',
                };
              }
              return {
                ...table,
                status: 'error',
                message: tError.message,
              };
            }

            return {
              ...table,
              status: 'ok',
              count: tCount ?? 0,
              message: `Tabela ativa e sincronizada (${tCount ?? 0} registros)`,
            };
          } catch (err: any) {
            return {
              ...table,
              status: 'error',
              message: err?.message || 'Erro ao consultar tabela',
            };
          }
        })
      );

      return {
        isConfigured: true,
        connected: true,
        latencyMs: latency,
        supabaseUrl: this.getMaskedUrl(),
        credentialSource: source,
        hasAnonKey: true,
        checkedAt: new Date().toLocaleTimeString('pt-BR'),
        tables: tablesResults,
      };
    } catch (e: any) {
      const latency = Math.round(performance.now() - startTime);
      return {
        isConfigured: true,
        connected: false,
        latencyMs: latency,
        supabaseUrl: this.getMaskedUrl(),
        credentialSource: source,
        hasAnonKey: key.length > 20,
        checkedAt: new Date().toLocaleTimeString('pt-BR'),
        tables: initialTables.map(t => ({ ...t, status: 'error' })),
        error: e?.message || 'Erro de rede ao contatar servidor Supabase.',
      };
    }
  }
};
