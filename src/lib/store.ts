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
  ServiceTracking,
  Payment,
  UserRole
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
  TRACKING: 'quemresolve_tracking',
  PAYMENTS: 'quemresolve_payments',
};

class AppStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();
  }

  private initData() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    // If not set, or old placeholder, initialize as Master Admin Khevine Oliveira
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
    if (!localStorage.getItem(STORAGE_KEYS.TRACKING)) {
      localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify({
        'req-ar-joao': {
          service_request_id: 'req-ar-joao',
          professional_id: 'pro-joao',
          latitude: -5.5255,
          longitude: -47.4775,
          eta_minutes: 12,
          recorded_at: new Date().toISOString(),
        }
      }));
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

  // --- Categories ---
  public getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
      is_active: cat.is_active ?? true,
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
    return newCat;
  }

  public toggleCategoryActive(categoryId: string): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      categories[index].is_active = !categories[index].is_active;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.notify();
    }
  }

  public deleteCategory(categoryId: string): void {
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  // --- Professionals ---
  public getProfessionals(): Professional[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    const pros: Professional[] = raw ? JSON.parse(raw) : INITIAL_PROFESSIONALS;
    // Enrich with profiles
    return pros.map(p => {
      const profile = INITIAL_PROFILES.find(pr => pr.id === p.profile_id);
      return { ...p, profile };
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
    }
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    return INITIAL_COMPANIES;
  }

  // --- Service Requests ---
  public getRequests(): ServiceRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const list: ServiceRequest[] = raw ? JSON.parse(raw) : INITIAL_REQUESTS;
    const categories = this.getCategories();
    const quotes = this.getQuotes();

    return list.map(req => {
      const category = categories.find(c => c.id === req.category_id);
      const reqQuotes = quotes.filter(q => q.service_request_id === req.id);
      const client = INITIAL_PROFILES.find(p => p.id === req.client_id) || INITIAL_PROFILES[0];
      return { ...req, category, quotes: reqQuotes, client };
    });
  }

  public getRequestById(id: string): ServiceRequest | undefined {
    return this.getRequests().find(r => r.id === id);
  }

  public createRequest(data: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>): ServiceRequest {
    const requests = this.getRequests();
    const newReq: ServiceRequest = {
      ...data,
      id: 'req-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    
    // Add auto-notification
    this.addNotification({
      user_id: newReq.client_id,
      title: 'Solicitação criada com sucesso!',
      message: `Buscando profissionais em ${IMPERATRIZ_CENTER.name} para "${newReq.title}".`,
      type: 'request_created',
    });

    this.notify();
    return newReq;
  }

  public updateRequestStatus(id: string, status: ServiceRequest['status']) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      requests[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

      // Trigger automatic notification based on status
      const req = requests[index];
      const statusTitles: Record<string, string> = {
        accepted: 'Orçamento aceito! Serviço confirmado.',
        professional_on_way: 'O profissional está a caminho!',
        in_progress: 'O serviço foi iniciado.',
        completed: 'Serviço concluído! Avalie seu profissional.',
        cancelled: 'Serviço cancelado.',
      };

      if (statusTitles[status]) {
        this.addNotification({
          user_id: req.client_id,
          title: statusTitles[status],
          message: `Atualização de status para: ${req.title}`,
          type: `status_${status}`,
        });
      }

      this.notify();
    }
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

    // Update request status to quotes_received
    this.updateRequestStatus(data.service_request_id, 'quotes_received');

    // Notify client
    const req = this.getRequestById(data.service_request_id);
    if (req) {
      this.addNotification({
        user_id: req.client_id,
        title: 'Novo orçamento recebido!',
        message: `Você recebeu uma proposta no valor de R$ ${data.amount.toFixed(2)}`,
        type: 'new_quote',
      });
    }

    this.notify();
    return newQuote;
  }

  public acceptQuote(quoteId: string, requestId: string) {
    const quotes = this.getQuotes();
    quotes.forEach(q => {
      if (q.service_request_id === requestId) {
        q.status = q.id === quoteId ? 'accepted' : 'rejected';
      }
    });
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    this.updateRequestStatus(requestId, 'accepted');
    this.notify();
  }

  // --- Tracking ---
  public getTracking(requestId: string): ServiceTracking | undefined {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKING);
    if (!raw) return undefined;
    const map = JSON.parse(raw);
    return map[requestId];
  }

  public updateTracking(requestId: string, data: Partial<ServiceTracking>) {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKING);
    const map = raw ? JSON.parse(raw) : {};
    map[requestId] = {
      ...map[requestId],
      ...data,
      service_request_id: requestId,
      recorded_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(map));
    this.notify();
  }

  // --- Messages & Chat ---
  public getMessages(conversationId?: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const list: Message[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
    if (conversationId) {
      return list.filter(m => m.conversation_id === conversationId);
    }
    return list;
  }

  public sendMessage(conversationId: string, senderId: string, message: string): Message {
    const list = this.getMessages();
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: senderId,
      message,
      message_type: 'text',
      read_at: undefined,
      created_at: new Date().toISOString(),
    };
    list.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    this.notify();
    return newMsg;
  }

  public markMessagesRead(conversationId: string, currentUserId: string) {
    const list = this.getMessages();
    let updated = false;
    list.forEach(m => {
      if (m.conversation_id === conversationId && m.sender_id !== currentUserId && !m.read_at) {
        m.read_at = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
      this.notify();
    }
  }

  // --- Notifications ---
  public getNotifications(userId?: string): Notification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (userId) {
      return list.filter(n => n.user_id === userId);
    }
    return list;
  }

  public addNotification(data: Omit<Notification, 'id' | 'created_at'>) {
    const list = this.getNotifications();
    const notif: Notification = {
      ...data,
      id: 'notif-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    list.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  public markNotificationRead(id: string) {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      this.notify();
    }
  }

  // --- Reviews ---
  public getReviews(proId?: string): Review[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list: Review[] = raw ? JSON.parse(raw) : [];
    if (proId) {
      return list.filter(r => r.professional_id === proId);
    }
    return list;
  }

  public createReview(data: Omit<Review, 'id' | 'created_at'>): Review {
    const list = this.getReviews();
    const newRev: Review = {
      ...data,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    list.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));

    // Recalculate rating on professional
    const pros = this.getProfessionals();
    const pro = pros.find(p => p.id === data.professional_id);
    if (pro) {
      const proReviews = list.filter(r => r.professional_id === data.professional_id);
      const avg = proReviews.reduce((sum, r) => sum + r.rating, 0) / proReviews.length;
      pro.rating = Number(avg.toFixed(1));
      pro.total_reviews = proReviews.length;
      localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(pros));
    }

    this.notify();
    return newRev;
  }

  // --- Favorites ---
  public getFavorites(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  }

  public toggleFavorite(proId: string): boolean {
    let favs = this.getFavorites();
    const isFav = favs.includes(proId);
    if (isFav) {
      favs = favs.filter(id => id !== proId);
    } else {
      favs.push(proId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    this.notify();
    return !isFav;
  }

  // --- Platform Settings ---
  public getPlatformFeePercentage(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return 10;
    try {
      const settings = JSON.parse(raw);
      return settings.platform_fee_percentage ?? 10;
    } catch {
      return 10;
    }
  }

  public setPlatformFeePercentage(fee: number) {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings.platform_fee_percentage = fee;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
  }

  // --- Payments ---
  public getPayments(): Payment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public processPayment(requestId: string, amount: number, proId: string, clientId: string): Payment {
    const feePercentage = this.getPlatformFeePercentage();
    const platformFee = Number(((amount * feePercentage) / 100).toFixed(2));
    const proAmount = Number((amount - platformFee).toFixed(2));

    const payments = this.getPayments();
    const payment: Payment = {
      id: 'pay-' + Date.now(),
      service_request_id: requestId,
      client_id: clientId,
      professional_id: proId,
      amount,
      platform_fee: platformFee,
      professional_amount: proAmount,
      status: 'paid',
      payment_method: 'PIX Instantâneo',
      created_at: new Date().toISOString(),
    };
    payments.unshift(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    this.updateRequestStatus(requestId, 'completed');
    this.notify();
    return payment;
  }
}

export const appStore = new AppStore();
