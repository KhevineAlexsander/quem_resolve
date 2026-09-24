import { getSupabase, isSupabaseConfigured, toDeterministicUUID } from '../lib/supabase';
import { appStore } from '../lib/store';
import { ServiceRequest, Quote, Message, Review, Category, Professional, Profile, ServiceStatusHistory } from '../types';

export interface SyncReport {
  timestamp: string;
  totalSynced: number;
  tables: Record<string, { success: number; failed: number; error?: string }>;
}

export const supabaseSyncService = {
  // --- 1. Sincronização de Solicitações (service_requests) ---
  async syncServiceRequest(req: ServiceRequest): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: req.id,
        client_id: req.client_id,
        category_id: req.category_id,
        title: req.title,
        description: req.description,
        status: req.status,
        scheduled_date: req.scheduled_date || null,
        scheduled_start: req.scheduled_start || null,
        address: req.address || '',
        street: req.street || null,
        number: req.number || null,
        neighborhood: req.neighborhood || null,
        city: req.city || 'Imperatriz',
        state: req.state || 'MA',
        zip_code: req.cep || null,
        complement: req.complement || null,
        latitude: req.latitude || -5.5266,
        longitude: req.longitude || -47.4797,
        urgency: req.urgency || 'normal',
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('service_requests')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao sincronizar solicitação no Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('Exceção ao sincronizar solicitação:', e);
      return { success: false, error: e?.message || 'Falha de rede' };
    }
  },

  // --- 2. Sincronização de Histórico de Status / Linha do Tempo ---
  async syncStatusHistory(historyItem: ServiceStatusHistory): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: historyItem.id,
        service_request_id: historyItem.service_request_id,
        status: historyItem.status,
        changed_by_name: historyItem.title || 'Sistema Automático',
        notes: historyItem.description || null,
        created_at: historyItem.created_at || new Date().toISOString(),
      };

      const { error } = await client
        .from('service_status_history')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao inserir histórico no Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 3. Sincronização de Orçamentos (quotes) ---
  async syncQuote(quote: Quote): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: quote.id,
        service_request_id: quote.service_request_id,
        professional_id: quote.professional_id,
        amount: quote.amount,
        description: quote.description || '',
        estimated_duration: quote.estimated_duration || '',
        available_date: quote.available_date || null,
        available_time: quote.available_time || null,
        status: quote.status,
        created_at: quote.created_at || new Date().toISOString(),
      };

      const { error } = await client
        .from('quotes')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao sincronizar orçamento no Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 4. Sincronização de Mensagens (messages) ---
  async syncMessage(msg: Message): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        message: msg.message,
        message_type: msg.message_type || 'text',
        read_at: msg.read_at || null,
        created_at: msg.created_at || new Date().toISOString(),
      };

      const { error } = await client
        .from('messages')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao enviar mensagem no Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 5. Sincronização de Avaliações (reviews) ---
  async syncReview(review: Review): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: review.id,
        service_request_id: review.service_request_id,
        client_id: review.client_id,
        professional_id: review.professional_id,
        rating: review.rating,
        comment: review.comment || '',
        created_at: review.created_at || new Date().toISOString(),
      };

      const { error } = await client
        .from('reviews')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao sincronizar avaliação no Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 6. Sincronização de Categorias (categories) ---
  async syncCategory(cat: Category): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const payload = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        icon: cat.icon || 'grid',
        image_url: cat.image_url || null,
        is_active: cat.is_active ?? true,
      };

      const { error } = await client
        .from('categories')
        .upsert(payload, { onConflict: 'id' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 7. Sincronização de Profissionais (professionals) ---
  async syncProfessional(pro: Professional): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      // 1. Garante perfil primeiro
      if (pro.profile) {
        await client.from('profiles').upsert({
          id: pro.profile.id,
          full_name: pro.profile.full_name,
          email: pro.profile.email,
          phone: pro.profile.phone || null,
          avatar_url: pro.profile.avatar_url || null,
          role: pro.profile.role || 'PROFISSIONAL',
        }, { onConflict: 'id' });
      }

      const payload = {
        id: pro.id,
        profile_id: pro.profile_id,
        bio: pro.bio || '',
        document_status: pro.document_status || 'approved',
        verification_status: pro.verification_status || 'verified',
        rating: pro.rating || 5.0,
        total_reviews: pro.total_reviews || 0,
        total_services: pro.total_services || 0,
        is_available: pro.is_available ?? true,
        latitude: pro.latitude || -5.5266,
        longitude: pro.longitude || -47.4797,
        service_radius_km: pro.service_radius_km || 25.0,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('professionals')
        .upsert(payload, { onConflict: 'id' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  },

  // --- 8. Enviar todos os dados locais para o Supabase (Push / Seed completo) ---
  async pushAllLocalToSupabase(): Promise<SyncReport> {
    const client = getSupabase();
    const report: SyncReport = {
      timestamp: new Date().toISOString(),
      totalSynced: 0,
      tables: {},
    };

    if (!isSupabaseConfigured() || !client) {
      report.tables['geral'] = { success: 0, failed: 1, error: 'Supabase não configurado com credenciais válidas' };
      return report;
    }

    // A. Profiles
    try {
      const profiles = appStore.getProfiles();
      const payload = profiles.map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone || null,
        avatar_url: p.avatar_url || null,
        role: p.role,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
      report.tables['profiles'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['profiles'] = { success: 0, failed: 1, error: e?.message };
    }

    // B. Categories
    try {
      const categories = appStore.getCategories();
      const payload = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        icon: c.icon || 'grid',
        image_url: c.image_url || null,
        is_active: c.is_active ?? true,
      }));
      const { error } = await client.from('categories').upsert(payload, { onConflict: 'id' });
      report.tables['categories'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['categories'] = { success: 0, failed: 1, error: e?.message };
    }

    // C. Professionals
    try {
      const professionals = appStore.getProfessionals();
      const payload = professionals.map(pro => ({
        id: pro.id,
        profile_id: pro.profile_id,
        bio: pro.bio || '',
        document_status: pro.document_status || 'approved',
        verification_status: pro.verification_status || 'verified',
        rating: pro.rating || 5.0,
        total_reviews: pro.total_reviews || 0,
        total_services: pro.total_services || 0,
        is_available: pro.is_available ?? true,
        latitude: pro.latitude || -5.5266,
        longitude: pro.longitude || -47.4797,
        service_radius_km: pro.service_radius_km || 25.0,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from('professionals').upsert(payload, { onConflict: 'id' });
      report.tables['professionals'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['professionals'] = { success: 0, failed: 1, error: e?.message };
    }

    // D. Service Requests
    try {
      const requests = appStore.getRequests();
      const payload = requests.map(req => ({
        id: req.id,
        client_id: req.client_id,
        category_id: req.category_id,
        title: req.title,
        description: req.description,
        status: req.status,
        scheduled_date: req.scheduled_date || null,
        scheduled_start: req.scheduled_start || null,
        address: req.address || '',
        street: req.street || null,
        number: req.number || null,
        neighborhood: req.neighborhood || null,
        city: req.city || 'Imperatriz',
        state: req.state || 'MA',
        zip_code: req.cep || null,
        complement: req.complement || null,
        latitude: req.latitude || -5.5266,
        longitude: req.longitude || -47.4797,
        urgency: req.urgency || 'normal',
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from('service_requests').upsert(payload, { onConflict: 'id' });
      report.tables['service_requests'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['service_requests'] = { success: 0, failed: 1, error: e?.message };
    }

    // E. Quotes
    try {
      const quotes = appStore.getQuotes();
      const payload = quotes.map(q => ({
        id: q.id,
        service_request_id: q.service_request_id,
        professional_id: q.professional_id,
        amount: q.amount,
        description: q.description || '',
        estimated_duration: q.estimated_duration || '',
        available_date: q.available_date || null,
        available_time: q.available_time || null,
        status: q.status,
        created_at: q.created_at || new Date().toISOString(),
      }));
      const { error } = await client.from('quotes').upsert(payload, { onConflict: 'id' });
      report.tables['quotes'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['quotes'] = { success: 0, failed: 1, error: e?.message };
    }

    // F. Reviews
    try {
      const reviews = appStore.getReviews();
      const payload = reviews.map(r => ({
        id: r.id,
        service_request_id: r.service_request_id,
        client_id: r.client_id,
        professional_id: r.professional_id,
        rating: r.rating,
        comment: r.comment || '',
        created_at: r.created_at || new Date().toISOString(),
      }));
      const { error } = await client.from('reviews').upsert(payload, { onConflict: 'id' });
      report.tables['reviews'] = { 
        success: error ? 0 : payload.length, 
        failed: error ? payload.length : 0, 
        error: error?.message 
      };
      if (!error) report.totalSynced += payload.length;
    } catch (e: any) {
      report.tables['reviews'] = { success: 0, failed: 1, error: e?.message };
    }

    return report;
  },

  // --- 9. Teste de Gravação Direta em Tempo Real ---
  async testDirectWrite(): Promise<{ success: boolean; message: string; durationMs: number }> {
    const start = performance.now();
    const client = getSupabase();
    if (!isSupabaseConfigured() || !client) {
      return {
        success: false,
        message: 'Supabase não está configurado no ambiente ou no painel.',
        durationMs: 0,
      };
    }

    const testId = 'test-write-' + Date.now();
    try {
      // Tenta gravar um registro de teste na tabela platform_settings
      const { error: insertErr } = await client
        .from('platform_settings')
        .upsert({
          key: testId,
          value: JSON.stringify({ ping: true, time: new Date().toISOString() }),
          description: 'Teste de diagnóstico de gravação em tempo real',
        });

      if (insertErr) {
        return {
          success: false,
          message: `Falha na gravação: ${insertErr.message} (Código: ${insertErr.code})`,
          durationMs: Math.round(performance.now() - start),
        };
      }

      // Lê de volta para certificar gravação real no Postgres
      const { data: readData, error: readErr } = await client
        .from('platform_settings')
        .select('*')
        .eq('key', testId)
        .single();

      if (readErr || !readData) {
        return {
          success: false,
          message: `Gravado, mas leitura falhou: ${readErr?.message || 'Registro não retornado'}`,
          durationMs: Math.round(performance.now() - start),
        };
      }

      // Remove o registro de teste
      await client.from('platform_settings').delete().eq('key', testId);

      return {
        success: true,
        message: 'Gravação e leitura no Supabase executadas com sucesso total!',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Erro inesperado durante teste de gravação',
        durationMs: Math.round(performance.now() - start),
      };
    }
  }
};
