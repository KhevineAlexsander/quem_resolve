import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  hasAnonKey: boolean;
  checkedAt: string;
  tables: TableHealth[];
  error?: string;
}

export const dbHealthService = {
  getMaskedUrl(): string | null {
    const url = import.meta.env.VITE_SUPABASE_URL;
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
    const url = import.meta.env.VITE_SUPABASE_URL || null;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    const configured = isSupabaseConfigured();

    const initialTables: TableHealth[] = [
      { name: 'profiles', label: 'Perfis de Usuários (profiles)', status: 'not_tested' },
      { name: 'service_requests', label: 'Solicitações (service_requests)', status: 'not_tested' },
      { name: 'service_status_history', label: 'Histórico de Linha do Tempo (service_status_history)', status: 'not_tested' },
      { name: 'quotes', label: 'Orçamentos (quotes)', status: 'not_tested' },
      { name: 'notifications', label: 'Notificações (notifications)', status: 'not_tested' },
      { name: 'categories', label: 'Categorias (categories)', status: 'not_tested' },
      { name: 'messages', label: 'Mensagens / Chat (messages)', status: 'not_tested' },
      { name: 'reviews', label: 'Avaliações (reviews)', status: 'not_tested' },
    ];

    if (!configured || !supabase) {
      return {
        isConfigured: false,
        connected: false,
        latencyMs: null,
        supabaseUrl: this.getMaskedUrl(),
        hasAnonKey: key.length > 20,
        checkedAt: new Date().toLocaleTimeString('pt-BR'),
        tables: initialTables.map(t => ({
          ...t,
          status: 'ok',
          message: 'Ativo em modo LocalStorage (Pronto para sincronizar)',
        })),
        error: 'Chaves do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY) não detectadas no ambiente. A aplicação está operando com persistência de alta performance em LocalStorage.',
      };
    }

    try {
      // 1. Testa conectividade básica
      const { data: pingData, error: pingError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const latency = Math.round(performance.now() - startTime);

      if (pingError && pingError.code !== 'PGRST116') {
        // Erro de conexão ou permissão
        return {
          isConfigured: true,
          connected: false,
          latencyMs: latency,
          supabaseUrl: this.getMaskedUrl(),
          hasAnonKey: key.length > 20,
          checkedAt: new Date().toLocaleTimeString('pt-BR'),
          tables: initialTables.map(t => ({ ...t, status: 'error', message: pingError.message })),
          error: `Falha ao conectar no Supabase: ${pingError.message} (Código: ${pingError.code || 'Desconhecido'})`,
        };
      }

      // 2. Testa cada tabela individualmente
      const tablesResults: TableHealth[] = await Promise.all(
        initialTables.map(async (table) => {
          try {
            const { count: tCount, error: tError } = await supabase!
              .from(table.name)
              .select('*', { count: 'exact', head: true });

            if (tError) {
              if (tError.code === '42P01') {
                return {
                  ...table,
                  status: 'missing',
                  message: 'Tabela não encontrada no schema público. Execute a migração SQL.',
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
              message: `Tabela ativa (${tCount ?? 0} registros)`,
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
        hasAnonKey: key.length > 20,
        checkedAt: new Date().toLocaleTimeString('pt-BR'),
        tables: initialTables.map(t => ({ ...t, status: 'error' })),
        error: e?.message || 'Erro de rede ao contatar servidor Supabase.',
      };
    }
  }
};
