-- ==============================================================================
-- QUEM RESOLVE - ATUALIZAÇÃO DO BANCO DE DADOS SUPABASE (MIGRAÇÃO DE STATUS & LINHA DO TEMPO)
-- Data: 2026-09-23
-- Descrição:
--   1. Adiciona a tabela 'service_status_history' para linha do tempo e auditoria
--   2. Atualiza os status aceitos em 'service_requests' (fluxo determinístico)
--   3. Adiciona campos de endereço estruturado (rua, número, bairro, etc.)
--   4. Configura índices de alta performance, RLS e Realtime
-- ==============================================================================

-- 1. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Atualiza a restrição de status na tabela service_requests
DO $$
BEGIN
    -- Remove restrições antigas de status se existirem
    ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
    ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS check_status;
    
    -- Aplica a nova validação abrangente aceitando status modernos e legados
    ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_status_check 
    CHECK (status IN (
        -- Novos status determinísticos (Sistema de Linha do Tempo)
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
        -- Compatibilidade retroativa com versões anteriores
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
        RAISE NOTICE 'Tabela service_requests ainda não criada. Prossiga com o schema inicial.';
END $$;

-- 3. Adiciona colunas de endereço estruturado em service_requests (se não existirem)
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

-- 4. Cria a tabela de Histórico de Status / Linha do Tempo (service_status_history)
CREATE TABLE IF NOT EXISTS public.service_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para consultas instantâneas na linha do tempo
CREATE INDEX IF NOT EXISTS idx_status_history_req ON public.service_status_history(service_request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON public.service_status_history(created_at);

-- 5. Trigger automático para registrar no histórico sempre que o status de uma solicitação mudar
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

-- 6. Configuração de Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.service_status_history ENABLE ROW LEVEL SECURITY;

-- Leitura pública ou autenticada do histórico
DROP POLICY IF EXISTS "Todos podem visualizar histórico de status" ON public.service_status_history;
CREATE POLICY "Todos podem visualizar histórico de status"
    ON public.service_status_history FOR SELECT
    TO public, authenticated
    USING (true);

-- Inserção de histórico por usuários autenticados ou aplicação
DROP POLICY IF EXISTS "Usuários autenticados podem inserir histórico" ON public.service_status_history;
CREATE POLICY "Usuários autenticados podem inserir histórico"
    ON public.service_status_history FOR INSERT
    TO public, authenticated
    WITH CHECK (true);

-- 7. Habilita Realtime no Supabase (Atualizações instantâneas no app)
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
END $$;

-- 8. Verificação de Sucesso
SELECT 
    'Migração executada com sucesso!' AS status,
    now() AS timestamp;
