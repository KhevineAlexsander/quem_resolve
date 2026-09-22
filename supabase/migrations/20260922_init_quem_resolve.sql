-- ==============================================================================
-- QUEM RESOLVE - SCHEMA COMPLETO DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Local de Referência Inicial: Imperatriz - MA
-- ==============================================================================

-- Habilita extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('CLIENTE', 'PROFISSIONAL', 'EMPRESA', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE PROFISSIONAIS (professionals)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    document_status TEXT DEFAULT 'pending' CHECK (document_status IN ('pending', 'approved', 'rejected')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified')),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    total_services INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    latitude DOUBLE PRECISION DEFAULT -5.5266, -- Imperatriz - MA
    longitude DOUBLE PRECISION DEFAULT -47.4797,
    service_radius_km NUMERIC(5, 2) DEFAULT 25.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE EMPRESAS (companies)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    latitude DOUBLE PRECISION DEFAULT -5.5266,
    longitude DOUBLE PRECISION DEFAULT -47.4797,
    verification_status TEXT DEFAULT 'verified',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE MEMBROS DA EMPRESA (company_members)
CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'tecnico',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CATEGORIAS (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- 6. TABELA DE SERVIÇOS (services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    pricing_type TEXT DEFAULT 'starting_at' CHECK (pricing_type IN ('fixed', 'starting_at', 'quote')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE SOLICITAÇÕES DE SERVIÇO (service_requests)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 
        'searching', 
        'quotes_received', 
        'accepted', 
        'professional_on_way', 
        'in_progress', 
        'completed', 
        'cancelled'
    )),
    scheduled_date DATE,
    scheduled_start TIME,
    scheduled_end TIME,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA DE IMAGENS DA SOLICITAÇÃO (service_request_images)
CREATE TABLE IF NOT EXISTS public.service_request_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABELA DE ORÇAMENTOS (quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    estimated_duration TEXT,
    available_date DATE,
    available_time TIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABELA DE DISPONIBILIDADE (availability)
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true
);

-- 11. TABELA DE AGENDAMENTOS (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled'))
);

-- 12. TABELAS DE CHAT (conversations, conversation_participants, messages)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. TABELA DE NOTIFICAÇÕES (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. TABELA DE AVALIAÇÕES (reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE UNIQUE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. TABELA DE FAVORITOS (favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, professional_id)
);

-- 16. TABELA DE RASTREAMENTO EM TEMPO REAL (service_tracking)
CREATE TABLE IF NOT EXISTS public.service_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. TABELA DE PAGAMENTOS (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    professional_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT DEFAULT 'pix',
    external_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. TABELA DE CUPONS (coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    max_discount NUMERIC(10, 2),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true
);

-- 19. CONFIGURAÇÃO DA PLATAFORMA (platform_settings)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE MÁXIMA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_professionals_lat_lon ON public.professionals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_professionals_profile_id ON public.professionals(profile_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_professional_id ON public.services(professional_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_category_id ON public.service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_lat_lon ON public.service_requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_quotes_service_request_id ON public.quotes(service_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_professional_id ON public.quotes(professional_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_service_tracking_req ON public.service_tracking(service_request_id);

-- ==============================================================================
-- TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE RATING E TOTAL_REVIEWS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.professionals
    SET 
        rating = (SELECT ROUND(AVG(rating), 2) FROM public.reviews WHERE professional_id = NEW.professional_id),
        total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE professional_id = NEW.professional_id),
        total_services = total_services + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.professional_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_professional_rating ON public.reviews;
CREATE TRIGGER trigger_update_professional_rating
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_professional_rating();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 1. Categorias e Configurações: Leitura pública
CREATE POLICY "Categorias leitura pública" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Configurações públicas para leitura" ON public.platform_settings FOR SELECT USING (true);

-- 2. Perfis: Qualquer um autenticado pode ver perfil público, dono altera
CREATE POLICY "Perfis visíveis para autenticados" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuário edita seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. Profissionais e Serviços: Leitura pública para busca e agendamento
CREATE POLICY "Profissionais visíveis para todos" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Profissional edita seu próprio cadastro" ON public.professionals FOR ALL USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Serviços visíveis para todos" ON public.services FOR SELECT USING (true);
CREATE POLICY "Profissional gerencia seus serviços" ON public.services FOR ALL USING (
    professional_id IN (SELECT p.id FROM public.professionals p JOIN public.profiles pr ON pr.id = p.profile_id WHERE pr.user_id = auth.uid())
);

-- 4. Solicitações: Cliente gerencia suas solicitações; profissionais veem solicitações abertas
CREATE POLICY "Cliente vê e cria suas solicitações" ON public.service_requests FOR ALL USING (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Profissionais veem solicitações abertas para orçar" ON public.service_requests FOR SELECT USING (
    status IN ('pending', 'searching', 'quotes_received')
);

-- 5. Orçamentos: Cliente vê orçamentos de seus pedidos; profissional vê os seus
CREATE POLICY "Profissional gerencia seus orçamentos" ON public.quotes FOR ALL USING (
    professional_id IN (SELECT p.id FROM public.professionals p JOIN public.profiles pr ON pr.id = p.profile_id WHERE pr.user_id = auth.uid())
);
CREATE POLICY "Cliente vê orçamentos recebidos" ON public.quotes FOR SELECT USING (
    service_request_id IN (SELECT id FROM public.service_requests WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- 6. Mensagens: Apenas participantes da conversa
CREATE POLICY "Participantes acessam conversas" ON public.conversations FOR ALL USING (
    id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Participantes enviam e leem mensagens" ON public.messages FOR ALL USING (
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- 7. Notificações: Dono vê suas notificações
CREATE POLICY "Usuário vê suas notificações" ON public.notifications FOR ALL USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- 8. Avaliações: Leitura pública
CREATE POLICY "Avaliações públicas para leitura" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Cliente cria avaliação para seu serviço" ON public.reviews FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ==============================================================================
-- CONFIGURAÇÃO DOS BUCKETS NO SUPABASE STORAGE
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('service-images', 'service-images', true),
  ('professional-gallery', 'professional-gallery', true),
  ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao Storage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Imagens públicas de avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Imagens públicas de avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Upload de avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Upload de avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Imagens públicas de serviços' AND tablename = 'objects') THEN
    CREATE POLICY "Imagens públicas de serviços" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Upload de fotos de serviços' AND tablename = 'objects') THEN
    CREATE POLICY "Upload de fotos de serviços" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Galeria pública de profissionais' AND tablename = 'objects') THEN
    CREATE POLICY "Galeria pública de profissionais" ON storage.objects FOR SELECT USING (bucket_id = 'professional-gallery');
  END IF;
END $$;

-- ==============================================================================
-- TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA DE NOVOS USUÁRIOS (AUTH.USERS -> PROFILES)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENTE')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- DADOS INICIAIS (SEED) — IMPERATRIZ, MARANHÃO
-- ==============================================================================
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('platform_fee_percentage', '10', 'Taxa percentual cobrada dos serviços pela plataforma Quem Resolve'),
    ('city_name', 'Imperatriz - MA', 'Cidade polo principal de atendimento'),
    ('support_phone', '(99) 98123-4567', 'Canal oficial de suporte Quem Resolve')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.categories (id, name, slug, description, icon, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Climatização', 'climatizacao', 'Instalação, limpeza e conserto de ar-condicionado e split', 'snowflake', true),
    ('c2222222-2222-2222-2222-222222222222', 'Elétrica', 'eletrica', 'Instalações elétricas, tomadas, quadros de luz e chuveiros', 'zap', true),
    ('c3333333-3333-3333-3333-333333333333', 'Hidráulica', 'hidraulica', 'Desentupimentos, vazamentos, torneiras e encanamentos', 'droplet', true),
    ('c4444444-4444-4444-4444-444444444444', 'Limpeza', 'limpeza', 'Faxina residencial, pós-obra, estofados e comercial', 'sparkles', true),
    ('c5555555-5555-5555-5555-555555555555', 'Construção', 'construcao', 'Pedreiro, reformas, pisos, azulejos e alvenaria', 'hard-hat', true),
    ('c6666666-6666-6666-6666-666666666666', 'Pintura', 'pintura', 'Pintura residencial, texturas, fachadas e vernizes', 'paint-roller', true),
    ('c7777777-7777-7777-7777-777777777777', 'Automotivo', 'automotivo', 'Mecânica rápida, socorro 24h, bateria e ar automotivo', 'wrench', true),
    ('c8888888-8888-8888-8888-888888888888', 'Tecnologia', 'tecnologia', 'Manutenção de computadores, celulares, redes Wi-Fi e câmeras', 'laptop', true),
    ('c9999999-9999-9999-9999-999999999999', 'Montagem', 'montagem', 'Montagem e desmontagem de móveis, guarda-roupas e painéis', 'tool', true),
    ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Outros', 'outros', 'Pequenos reparos, chaveiro, carretos e jardinagem', 'grid', true)
ON CONFLICT (slug) DO NOTHING;
