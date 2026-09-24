import { 
  Profile, 
  Professional, 
  Company, 
  Category, 
  ServiceRequest, 
  Quote, 
  Message, 
  Notification, 
  Review, 
  Favorite, 
  Payment,
  UserRole,
  ServiceTrackingStatus,
  ServiceStatusHistory
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PROFILES, 
  INITIAL_COMPANIES, 
  INITIAL_PROFESSIONALS, 
  INITIAL_REQUESTS, 
  INITIAL_QUOTES, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS,
  IMPERATRIZ_CENTER
} from './initialData';
import { normalizeStatus, getStatusMeta, canTransitionStatus } from './statusRules';

const STORAGE_KEYS = {
  CURRENT_USER: 'quemresolve_current_user',
  REQUESTS: 'quemresolve_requests',
  QUOTES: 'quemresolve_quotes',
  MESSAGES: 'quemresolve_messages',
  NOTIFICATIONS: 'quemresolve_notifications',
  REVIEWS: 'quemresolve_reviews',
  FAVORITES: 'quemresolve_favorites',
  PROFESSIONALS: 'quemresolve_professionals',
  CATEGORIES: 'quemresolve_categories',
  SETTINGS: 'quemresolve_settings',
  STATUS_HISTORY: 'quemresolve_status_history',
  PAYMENTS: 'quemresolve_payments',
};

// Initial demo status history for seamless timeline visualization
const INITIAL_STATUS_HISTORY: Record<string, ServiceStatusHistory[]> = {
  'req-ar-joao': [
    {
      id: 'hist-1',
      service_request_id: 'req-ar-joao',
      status: 'REQUESTED',
      title: 'Solicitação criada',
      description: 'Solicitação registrada pelo cliente Lucas Ferreira.',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      created_by: 'prof-lucas',
    },
    {
      id: 'hist-2',
      service_request_id: 'req-ar-joao',
      status: 'PROFESSIONALS_NOTIFIED',
      title: 'Profissionais notificados',
      description: '3 profissionais qualificados em Imperatriz foram notificados.',
      created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    },
    {
      id: 'hist-3',
      service_request_id: 'req-ar-joao',
      status: 'QUOTE_RECEIVED',
      title: 'Novo orçamento recebido',
      description: 'João Silva enviou orçamento no valor de R$ 180,00.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      created_by: 'prof-joao',
    },
    {
      id: 'hist-4',
      service_request_id: 'req-ar-joao',
      status: 'PROFESSIONAL_SELECTED',
      title: 'Profissional selecionado',
      description: 'Lucas escolheu João Silva para realizar o serviço.',
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      created_by: 'prof-lucas',
    },
    {
      id: 'hist-5',
      service_request_id: 'req-ar-joao',
      status: 'SCHEDULED',
      title: 'Serviço agendado',
      description: 'Atendimento confirmado para hoje às 10:30.',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'hist-6',
      service_request_id: 'req-ar-joao',
      status: 'ON_THE_WAY',
      title: 'Profissional a caminho',
      description: 'João Silva informou que está a caminho do seu endereço.',
      created_at: new Date(Date.now() - 60000 * 25).toISOString(),
      created_by: 'prof-joao',
    },
  ],
  'req-hist-1': [
    {
      id: 'hist-h1',
      service_request_id: 'req-hist-1',
      status: 'REQUESTED',
      title: 'Solicitação criada',
      description: 'Solicitação registrada.',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'hist-h2',
      service_request_id: 'req-hist-1',
      status: 'PROFESSIONALS_NOTIFIED',
      title: 'Profissionais notificados',
      description: 'Profissionais notificados.',
      created_at: new Date(Date.now() - 86400000 * 4 + 3600000).toISOString(),
    },
    {
      id: 'hist-h3',
      service_request_id: 'req-hist-1',
      status: 'QUOTE_RECEIVED',
      title: 'Novo orçamento recebido',
      description: 'Orçamento recebido.',
      created_at: new Date(Date.now() - 86400000 * 4 + 7200000).toISOString(),
    },
    {
      id: 'hist-h4',
      service_request_id: 'req-hist-1',
      status: 'PROFESSIONAL_SELECTED',
      title: 'Profissional selecionado',
      description: 'Profissional selecionado.',
      created_at: new Date(Date.now() - 86400000 * 3.5).toISOString(),
    },
    {
      id: 'hist-h5',
      service_request_id: 'req-hist-1',
      status: 'SCHEDULED',
      title: 'Serviço agendado',
      description: 'Agendamento confirmado.',
      created_at: new Date(Date.now() - 86400000 * 3.5 + 3600000).toISOString(),
    },
    {
      id: 'hist-h6',
      service_request_id: 'req-hist-1',
      status: 'ON_THE_WAY',
      title: 'Profissional a caminho',
      description: 'Profissional a caminho.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'hist-h7',
      service_request_id: 'req-hist-1',
      status: 'ARRIVED',
      title: 'Profissional chegou ao local',
      description: 'Chegou ao local.',
      created_at: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(),
    },
    {
      id: 'hist-h8',
      service_request_id: 'req-hist-1',
      status: 'IN_PROGRESS',
      title: 'Serviço em andamento',
      description: 'Serviço iniciado.',
      created_at: new Date(Date.now() - 86400000 * 3 + 2400000).toISOString(),
    },
    {
      id: 'hist-h9',
      service_request_id: 'req-hist-1',
      status: 'COMPLETED',
      title: 'Serviço concluído',
      description: 'Atendimento finalizado com sucesso.',
      created_at: new Date(Date.now() - 86400000 * 3 + 7200000).toISOString(),
    },
  ],
};

class AppStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();
  }

  private initData() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!savedUser || (savedUser && !savedUser.includes('khevineoliveira@gmail.com') && !savedUser.includes('ADMIN'))) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_PROFILES[0])); // Khevine Oliveira (ADMIN)
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFESSIONALS)) {
      localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(INITIAL_PROFESSIONALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ platform_fee_percentage: 10, city: 'Imperatriz - MA' }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STATUS_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.STATUS_HISTORY, JSON.stringify(INITIAL_STATUS_HISTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([
        {
          id: 'rev-1',
          service_request_id: 'req-hist-1',
          client_id: 'prof-lucas',
          client: INITIAL_PROFILES[1],
          professional_id: 'pro-joao',
          rating: 5,
          comment: 'Serviço impecável! João chegou pontual, higienizou o Split e deixou tudo limpinho. Super recomendo em Imperatriz!',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['pro-joao']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
  }

  public resetToCleanInitialData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    this.initData();
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private mutationListeners: Set<(event: string, payload: any) => void> = new Set();

  public onMutation(listener: (event: string, payload: any) => void) {
    this.mutationListeners.add(listener);
    return () => {
      this.mutationListeners.delete(listener);
    };
  }

  public emitMutation(event: string, payload: any) {
    this.mutationListeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch (err) {
        console.warn('[Store] Erro no listener de mutação:', err);
      }
    });
  }

  // --- Merge methods para sincronização bidirecional do Supabase ---
  public mergeRequestsFromSupabase(supaRequests: ServiceRequest[]) {
    if (!supaRequests || supaRequests.length === 0) return;
    const current = this.getRequests();
    const map = new Map<string, ServiceRequest>();
    current.forEach(r => map.set(r.id, r));
    supaRequests.forEach(r => {
      const existing = map.get(r.id);
      map.set(r.id, existing ? { ...existing, ...r } : r);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(merged));
    this.notify();
  }

  public mergeQuotesFromSupabase(supaQuotes: Quote[]) {
    if (!supaQuotes || supaQuotes.length === 0) return;
    const current = this.getQuotes();
    const map = new Map<string, Quote>();
    current.forEach(q => map.set(q.id, q));
    supaQuotes.forEach(q => {
      const existing = map.get(q.id);
      map.set(q.id, existing ? { ...existing, ...q } : q);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(merged));
    this.notify();
  }

  public mergeCategoriesFromSupabase(supaCats: Category[]) {
    if (!supaCats || supaCats.length === 0) return;
    const current = this.getCategories();
    const map = new Map<string, Category>();
    current.forEach(c => map.set(c.id, c));
    supaCats.forEach(c => {
      const existing = map.get(c.id);
      map.set(c.id, existing ? { ...existing, ...c } : c);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged));
    this.notify();
  }

  public mergeMessagesFromSupabase(supaMsgs: Message[]) {
    if (!supaMsgs || supaMsgs.length === 0) return;
    const current = this.getMessages();
    const map = new Map<string, Message>();
    current.forEach(m => map.set(m.id, m));
    supaMsgs.forEach(m => {
      const existing = map.get(m.id);
      map.set(m.id, existing ? { ...existing, ...m } : m);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(merged));
    this.notify();
  }

  public mergeReviewsFromSupabase(supaRevs: Review[]) {
    if (!supaRevs || supaRevs.length === 0) return;
    const current = this.getReviews();
    const map = new Map<string, Review>();
    current.forEach(r => map.set(r.id, r));
    supaRevs.forEach(r => {
      const existing = map.get(r.id);
      map.set(r.id, existing ? { ...existing, ...r } : r);
    });
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(merged));
    this.notify();
  }

  public mergeStatusHistoryFromSupabase(histories: ServiceStatusHistory[]) {
    if (!histories || histories.length === 0) return;
    const raw = localStorage.getItem(STORAGE_KEYS.STATUS_HISTORY);
    const historyMap: Record<string, ServiceStatusHistory[]> = raw ? JSON.parse(raw) : INITIAL_STATUS_HISTORY;
    histories.forEach(h => {
      if (!historyMap[h.service_request_id]) {
        historyMap[h.service_request_id] = [];
      }
      const existingIndex = historyMap[h.service_request_id].findIndex(x => x.id === h.id);
      if (existingIndex === -1) {
        historyMap[h.service_request_id].push(h);
      } else {
        historyMap[h.service_request_id][existingIndex] = { ...historyMap[h.service_request_id][existingIndex], ...h };
      }
    });
    localStorage.setItem(STORAGE_KEYS.STATUS_HISTORY, JSON.stringify(historyMap));
    this.notify();
  }

  // --- Current User / Profile ---
  public getCurrentUser(): Profile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_PROFILES[0];
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PROFILES[0];
    }
  }

  public setCurrentUser(profile: Profile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
    this.notify();
  }

  public switchRole(role: UserRole) {
    const match = INITIAL_PROFILES.find(p => p.role === role);
    if (match) {
      this.setCurrentUser(match);
    }
  }

  public getProfiles(): Profile[] {
    return INITIAL_PROFILES;
  }

  public getProfileById(id: string): Profile | undefined {
    return INITIAL_PROFILES.find(p => p.id === id || p.user_id === id);
  }

  public updateProfile(updated: Partial<Profile>) {
    const current = this.getCurrentUser();
    const merged = { ...current, ...updated, updated_at: new Date().toISOString() };
    this.setCurrentUser(merged);
  }

  // --- Categories ---
  public getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories().find(c => c.slug === slug);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.getCategories().find(c => c.id === id);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const list = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    list.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notify();
    this.emitMutation('ADD_CATEGORY', newCat);
    return newCat;
  }

  public deleteCategory(id: string) {
    const list = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    this.notify();
    this.emitMutation('DELETE_CATEGORY', { id });
  }

  public toggleCategoryActive(id: string) {
    const list = this.getCategories();
    const target = list.find(c => c.id === id);
    if (target) {
      target.is_active = !target.is_active;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
      this.notify();
      this.emitMutation('UPDATE_CATEGORY', target);
    }
  }

  // --- Professionals ---
  public getProfessionals(): Professional[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    const list: Professional[] = raw ? JSON.parse(raw) : INITIAL_PROFESSIONALS;
    return list.map(pro => {
      const profile = INITIAL_PROFILES.find(p => p.id === pro.profile_id);
      return { ...pro, profile };
    });
  }

  public getProfessionalById(id: string): Professional | undefined {
    return this.getProfessionals().find(p => p.id === id || p.profile_id === id);
  }

  public updateProfessionalAvailability(proId: string, isAvailable: boolean) {
    const pros = this.getProfessionals();
    const index = pros.findIndex(p => p.id === proId);
    if (index !== -1) {
      pros[index].is_available = isAvailable;
      localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(pros));
      this.notify();
      this.emitMutation('UPDATE_PROFESSIONAL', pros[index]);
    }
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    return INITIAL_COMPANIES;
  }

  // --- Status History ---
  public getStatusHistory(requestId: string): ServiceStatusHistory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STATUS_HISTORY);
    if (!raw) return [];
    try {
      const map: Record<string, ServiceStatusHistory[]> = JSON.parse(raw);
      return map[requestId] || [];
    } catch {
      return [];
    }
  }

  public addStatusHistory(
    requestId: string,
    status: ServiceTrackingStatus,
    title: string,
    description: string,
    createdBy?: string
  ): ServiceStatusHistory {
    const raw = localStorage.getItem(STORAGE_KEYS.STATUS_HISTORY);
    const map: Record<string, ServiceStatusHistory[]> = raw ? JSON.parse(raw) : {};
    
    if (!map[requestId]) {
      map[requestId] = [];
    }

    const newEntry: ServiceStatusHistory = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      service_request_id: requestId,
      status,
      title,
      description,
      created_at: new Date().toISOString(),
      created_by: createdBy,
    };

    map[requestId].push(newEntry);
    localStorage.setItem(STORAGE_KEYS.STATUS_HISTORY, JSON.stringify(map));
    return newEntry;
  }

  // --- Service Requests ---
  public getRequests(): ServiceRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const list: ServiceRequest[] = raw ? JSON.parse(raw) : INITIAL_REQUESTS;
    const categories = this.getCategories();
    const quotes = this.getQuotes();
    const pros = this.getProfessionals();

    return list.map(req => {
      const category = categories.find(c => c.id === req.category_id);
      const reqQuotes = quotes.filter(q => q.service_request_id === req.id);
      const client = INITIAL_PROFILES.find(p => p.id === req.client_id) || INITIAL_PROFILES[0];
      const history = this.getStatusHistory(req.id);
      
      let selectedPro = req.selected_professional_id 
        ? pros.find(p => p.id === req.selected_professional_id)
        : undefined;

      // Se houver quote aceito e não estiver explicitado, seleciona o pro correspondente
      if (!selectedPro && reqQuotes.length > 0) {
        const acceptedQuote = reqQuotes.find(q => q.status === 'accepted');
        if (acceptedQuote) {
          selectedPro = pros.find(p => p.id === acceptedQuote.professional_id);
        }
      }

      return { 
        ...req, 
        category, 
        quotes: reqQuotes, 
        client, 
        status_history: history,
        selected_professional: selectedPro 
      };
    });
  }

  public getRequestById(id: string): ServiceRequest | undefined {
    return this.getRequests().find(r => r.id === id);
  }

  public createRequest(data: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>): ServiceRequest {
    const requests = this.getRequests();
    const newReqId = 'req-' + Date.now();
    
    // Constrói campos de endereço estruturados
    const address = data.address || `${data.street || 'Rua'}, ${data.number || 'S/N'} - ${data.neighborhood || 'Centro'}, ${data.city || 'Imperatriz'} - ${data.state || 'MA'}`;

    const newReq: ServiceRequest = {
      ...data,
      id: newReqId,
      address,
      status: 'REQUESTED',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      scheduled_start: data.scheduled_start || '09:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    // Registra histórico inicial
    this.addStatusHistory(
      newReqId,
      'REQUESTED',
      'Solicitação criada',
      `Solicitação "${newReq.title}" registrada com sucesso.`,
      newReq.client_id
    );

    // Registra notificação dos profissionais
    setTimeout(() => {
      this.addStatusHistory(
        newReqId,
        'PROFESSIONALS_NOTIFIED',
        'Profissionais notificados',
        'Profissionais qualificados da região de Imperatriz foram notificados.',
      );
      this.notify();
    }, 1200);

    // Auto-notificação para o cliente
    this.addNotification({
      user_id: newReq.client_id,
      title: '📋 Solicitação criada com sucesso!',
      message: `Buscando profissionais em Imperatriz - MA para "${newReq.title}".`,
      type: 'request_created',
      data: { service_request_id: newReqId, status: 'REQUESTED' }
    });

    this.notify();
    this.emitMutation('CREATE_REQUEST', newReq);
    return newReq;
  }

  public updateRequestStatus(
    id: string, 
    newStatus: ServiceTrackingStatus | string, 
    proName?: string,
    customDescription?: string
  ): { success: boolean; error?: string } {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return { success: false, error: 'Solicitação não encontrada.' };

    const req = requests[index];
    const currentNorm = normalizeStatus(req.status);
    const targetNorm = normalizeStatus(newStatus);

    // Validação rígida de transição
    const validation = canTransitionStatus(currentNorm, targetNorm, true);
    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    req.status = targetNorm;
    req.updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Metadados do status
    const meta = getStatusMeta(targetNorm);
    const resolvedProName = proName || req.selected_professional?.profile?.full_name || 'Profissional';
    
    // Descrição dinâmica para histórico
    let historyDesc = customDescription;
    if (!historyDesc) {
      switch (targetNorm) {
        case 'ON_THE_WAY':
          historyDesc = `${resolvedProName} informou que está a caminho do local.`;
          break;
        case 'ARRIVED':
          historyDesc = `${resolvedProName} chegou ao endereço do cliente.`;
          break;
        case 'IN_PROGRESS':
          historyDesc = `${resolvedProName} iniciou a execução do serviço.`;
          break;
        case 'COMPLETED':
          historyDesc = `Serviço concluído com sucesso por ${resolvedProName}.`;
          break;
        case 'SCHEDULED':
          historyDesc = `Atendimento confirmado para ${req.scheduled_date || 'hoje'} às ${req.scheduled_start || '10:00'}.`;
          break;
        default:
          historyDesc = meta.clientDescription;
      }
    }

    // Registra entrada no histórico
    this.addStatusHistory(
      id,
      targetNorm,
      meta.title,
      historyDesc,
      this.getCurrentUser().id
    );

    // Cria notificação rica em tempo real para o cliente
    this.addNotification({
      user_id: req.client_id,
      title: meta.notificationTitle,
      message: meta.notificationMessage(resolvedProName),
      type: `status_${targetNorm.toLowerCase()}`,
      data: {
        service_request_id: id,
        status: targetNorm,
        url: `/solicitacoes/${id}`,
      }
    });

    this.notify();
    this.emitMutation('UPDATE_REQUEST', req);
    const historyList = this.getStatusHistory(id);
    const latestHistory = historyList[historyList.length - 1];
    if (latestHistory) {
      this.emitMutation('UPDATE_STATUS_HISTORY', latestHistory);
    }
    return { success: true };
  }

  // --- Quotes ---
  public getQuotes(): Quote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    const list: Quote[] = raw ? JSON.parse(raw) : INITIAL_QUOTES;
    const pros = this.getProfessionals();
    return list.map(q => {
      const pro = pros.find(p => p.id === q.professional_id);
      return { ...q, professional: pro };
    });
  }

  public createQuote(data: Omit<Quote, 'id' | 'created_at'>): Quote {
    const quotes = this.getQuotes();
    const newQuote: Quote = {
      ...data,
      id: 'quote-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    quotes.push(newQuote);
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));

    // Update request status to QUOTE_RECEIVED
    this.updateRequestStatus(data.service_request_id, 'QUOTE_RECEIVED');

    // Notify client
    const req = this.getRequestById(data.service_request_id);
    const pro = this.getProfessionalById(data.professional_id);
    if (req) {
      this.addNotification({
        user_id: req.client_id,
        title: '💰 Novo orçamento recebido!',
        message: `${pro?.profile?.full_name || 'Um profissional'} enviou uma proposta no valor de R$ ${data.amount.toFixed(2)}`,
        type: 'new_quote',
        data: { service_request_id: data.service_request_id }
      });
    }

    this.notify();
    this.emitMutation('CREATE_QUOTE', newQuote);
    return newQuote;
  }

  public acceptQuote(quoteId: string, requestId: string) {
    const quotes = this.getQuotes();
    let chosenProId = '';
    quotes.forEach(q => {
      if (q.service_request_id === requestId) {
        if (q.id === quoteId) {
          q.status = 'accepted';
          chosenProId = q.professional_id;
        } else {
          q.status = 'rejected';
        }
      }
    });
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));

    // Atualiza solicitação com o profissional escolhido e avança status
    const requests = this.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
      requests[reqIndex].selected_professional_id = chosenProId;
      requests[reqIndex].status = 'PROFESSIONAL_SELECTED';
      requests[reqIndex].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }

    const pro = this.getProfessionalById(chosenProId);
    this.addStatusHistory(
      requestId,
      'PROFESSIONAL_SELECTED',
      'Profissional selecionado',
      `O cliente escolheu ${pro?.profile?.full_name || 'o profissional'} para o serviço.`,
      this.getCurrentUser().id
    );

    // Auto avança para SCHEDULED se tiver data definida
    this.addStatusHistory(
      requestId,
      'SCHEDULED',
      'Serviço agendado',
      'Atendimento confirmado na agenda.',
    );

    this.addNotification({
      user_id: pro?.profile_id || '',
      title: '🎉 Orçamento Aprovado!',
      message: `Você foi escolhido para o atendimento em Imperatriz - MA!`,
      type: 'quote_accepted',
      data: { service_request_id: requestId }
    });

    this.notify();
    const chosenQuote = this.getQuotes().find(q => q.id === quoteId);
    if (chosenQuote) {
      this.emitMutation('UPDATE_QUOTE', chosenQuote);
    }
    const updatedReq = this.getRequestById(requestId);
    if (updatedReq) {
      this.emitMutation('UPDATE_REQUEST', updatedReq);
    }
  }

  // --- Messages / Chat ---
  public getMessages(conversationId?: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const list: Message[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
    if (conversationId) {
      return list.filter(m => m.conversation_id === conversationId);
    }
    return list;
  }

  public getMessagesByConversation(conversationId: string): Message[] {
    return this.getMessages(conversationId);
  }

  public sendMessage(conversationId: string, senderId: string, text: string): Message {
    const messages = this.getMessages();
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: senderId,
      message: text,
      message_type: 'text',
      created_at: new Date().toISOString(),
    };
    messages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    this.notify();
    this.emitMutation('SEND_MESSAGE', newMsg);
    return newMsg;
  }

  public markMessagesRead(conversationId: string, currentUserId: string) {
    const messages = this.getMessages();
    messages.forEach(m => {
      if (m.conversation_id === conversationId && m.sender_id !== currentUserId) {
        m.read_at = new Date().toISOString();
      }
    });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    this.notify();
  }

  // --- Payments & Settings ---
  public getPayments(): any[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public processPayment(
    requestIdOrData: any,
    amount?: number,
    proId?: string,
    clientId?: string
  ): any {
    const list = this.getPayments();
    let newPay: any;

    if (typeof requestIdOrData === 'object' && requestIdOrData !== null) {
      newPay = {
        ...requestIdOrData,
        id: 'pay-' + Date.now(),
        status: 'paid',
        created_at: new Date().toISOString(),
      };
    } else {
      const fee = ((amount || 0) * this.getPlatformFeePercentage()) / 100;
      newPay = {
        id: 'pay-' + Date.now(),
        service_request_id: requestIdOrData,
        amount: amount || 0,
        platform_fee: fee,
        professional_amount: (amount || 0) - fee,
        professional_id: proId || '',
        client_id: clientId || '',
        status: 'paid',
        payment_method: 'PIX',
        created_at: new Date().toISOString(),
      };
    }

    list.unshift(newPay);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(list));
    this.notify();
    return newPay;
  }

  public getPlatformFeePercentage(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return 10;
    try {
      return JSON.parse(raw).platform_fee_percentage || 10;
    } catch {
      return 10;
    }
  }

  public setPlatformFeePercentage(fee: number) {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const curr = raw ? JSON.parse(raw) : {};
    curr.platform_fee_percentage = fee;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(curr));
    this.notify();
  }

  // --- Notifications ---
  public getNotifications(userId?: string): Notification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (userId) {
      return list.filter(n => n.user_id === userId || n.user_id === 'all');
    }
    return list;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'created_at'>): Notification {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify();
    return newNotif;
  }

  public markNotificationRead(id: string) {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read_at) {
      notif.read_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      this.notify();
    }
  }

  public markAllNotificationsRead(userId?: string) {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (!userId || n.user_id === userId || n.user_id === 'all') {
        n.read_at = new Date().toISOString();
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify();
  }

  // --- Reviews ---
  public getReviews(professionalId?: string): Review[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list: Review[] = raw ? JSON.parse(raw) : [];
    if (professionalId) {
      return list.filter(r => r.professional_id === professionalId);
    }
    return list;
  }

  public createReview(data: Omit<Review, 'id' | 'created_at'>): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      ...data,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    this.notify();
    this.emitMutation('CREATE_REVIEW', newRev);
    return newRev;
  }
}

export const appStore = new AppStore();
