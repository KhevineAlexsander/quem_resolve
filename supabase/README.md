# Quem Resolve — Backend Supabase & PostgreSQL

Este diretório contém os scripts de banco de dados e regras de segurança para a plataforma **Quem Resolve**.

## 🚀 Como configurar no Supabase:

1. **Acesse o Painel do Supabase**: [supabase.com](https://supabase.com)
2. **Crie ou selecione seu projeto**.
3. **Abra o SQL Editor**:
   - Copie o conteúdo de `supabase/migrations/20260922_init_quem_resolve.sql`.
   - Cole e clique em **Run**.
4. **Configure o Storage**:
   - Vá em **Storage** > **New Bucket**.
   - Crie os buckets:
     * `avatars` (Público)
     * `service-images` (Privado/Autenticado)
     * `professional-gallery` (Público)
     * `company-assets` (Público)
     * `chat-images` (Privado)
5. **Configurar Variáveis de Ambiente**:
   - No painel Supabase, vá em **Project Settings** > **API**.
   - Copie `Project URL` e insira no arquivo `.env` como:
     ```env
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     ```
   - Copie a chave `anon / public` e insira como:
     ```env
     VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anonima-publica
     ```
   - Para o Mapbox, gere um token gratuito em [mapbox.com](https://mapbox.com) e insira:
     ```env
     VITE_MAPBOX_ACCESS_TOKEN=pk.seu_token_mapbox
     ```
