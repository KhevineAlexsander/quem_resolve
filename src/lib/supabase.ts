import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'quemresolve_supabase_url',
  SUPABASE_KEY: 'quemresolve_supabase_anon_key',
};

// Obter URL e Key tanto das variáveis de ambiente (.env) quanto do LocalStorage configurado no painel
export const getSupabaseCredentials = (): { url: string; key: string; source: 'env' | 'custom' | 'none' } => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) : null;

  if (customUrl && customUrl.startsWith('http') && customKey && customKey.length > 20) {
    return { url: customUrl.trim(), key: customKey.trim(), source: 'custom' };
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envUrl.startsWith('http') && envKey && envKey.length > 20) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }

  return { 
    url: customUrl || envUrl || '', 
    key: customKey || envKey || '', 
    source: 'none' 
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && url.startsWith('http') && key && key.length > 20);
};

let activeSupabaseClient: SupabaseClient | null = null;
let lastClientKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();
  if (!url || !url.startsWith('http') || !key || key.length <= 20) {
    activeSupabaseClient = null;
    return null;
  }

  const clientKey = `${url}:::${key}`;
  if (!activeSupabaseClient || lastClientKey !== clientKey) {
    try {
      activeSupabaseClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      lastClientKey = clientKey;
    } catch (err) {
      console.warn('Erro ao inicializar cliente Supabase:', err);
      activeSupabaseClient = null;
    }
  }

  return activeSupabaseClient;
};

// Exporta o cliente dinâmico
export const supabase = getSupabase();

export const saveSupabaseCredentials = (url: string, key: string): { success: boolean; error?: string } => {
  if (!url || !url.startsWith('http')) {
    return { success: false, error: 'A URL do Supabase deve começar com https://' };
  }
  if (!key || key.length < 20) {
    return { success: false, error: 'A Chave Pública Anon deve ter pelo menos 20 caracteres' };
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
    getSupabase(); // Força recriação do cliente
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao salvar credenciais' };
  }
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  activeSupabaseClient = null;
  lastClientKey = '';
};

// Converte identificadores de string (ex: 'prof-lucas', 'req-123') para formato UUID válido quando necessário
export const toDeterministicUUID = (str: string): string => {
  if (!str) return '00000000-0000-4000-8000-000000000000';
  
  // Se já for UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str.toLowerCase();
  }

  // Gera hash hexadecimal de 32 caracteres a partir da string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  
  // Converte a string e timestamp para uma representação hexadecimal determinística
  const hex = Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(32, '0')
    .slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
