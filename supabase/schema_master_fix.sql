-- ==============================================================================
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

-- Confirmação final
SELECT 'Configuração do Supabase concluída com sucesso!' AS resultado, now() AS horario;
