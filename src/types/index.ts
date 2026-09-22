export type UserRole = 'CLIENTE' | 'PROFISSIONAL' | 'EMPRESA' | 'ADMIN';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Professional {
  id: string;
  profile_id: string;
  profile?: Profile;
  bio?: string;
  document_status: 'pending' | 'approved' | 'rejected';
  verification_status: 'unverified' | 'verified';
  rating: number;
  total_reviews: number;
  total_services: number;
  is_available: boolean;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  specialties?: string[];
  hourly_rate?: number;
  company_id?: string;
  created_at: string;
}

export interface Company {
  id: string;
  owner_profile_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude: number;
  longitude: number;
  verification_status: 'unverified' | 'verified';
  rating: number;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  professional_id: string;
  professional?: Professional;
  role: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url?: string;
  is_active: boolean;
}

export interface Service {
  id: string;
  professional_id: string;
  category_id: string;
  title: string;
  description: string;
  base_price: number;
  pricing_type: 'fixed' | 'starting_at' | 'quote';
  is_active: boolean;
  created_at: string;
}

export type ServiceRequestStatus =
  | 'pending'
  | 'searching'
  | 'quotes_received'
  | 'accepted'
  | 'professional_on_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  client_id: string;
  client?: Profile;
  category_id: string;
  category?: Category;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  scheduled_date?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  address: string;
  latitude: number;
  longitude: number;
  urgency: 'normal' | 'urgent';
  images?: ServiceRequestImage[];
  quotes?: Quote[];
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestImage {
  id: string;
  service_request_id: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export interface Quote {
  id: string;
  service_request_id: string;
  professional_id: string;
  professional?: Professional;
  amount: number;
  description: string;
  estimated_duration: string;
  available_date: string;
  available_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

export interface Appointment {
  id: string;
  service_request_id: string;
  professional_id: string;
  client_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}

export interface Availability {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Conversation {
  id: string;
  service_request_id?: string;
  participants: Profile[];
  last_message?: Message;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  read_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  service_request_id: string;
  client_id: string;
  client?: Profile;
  professional_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  client_id: string;
  professional_id: string;
  professional?: Professional;
  created_at: string;
}

export interface ServiceTracking {
  id: string;
  service_request_id: string;
  professional_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  eta_minutes?: number;
  recorded_at: string;
}

export interface Payment {
  id: string;
  service_request_id: string;
  client_id: string;
  professional_id: string;
  amount: number;
  platform_fee: number;
  professional_amount: number;
  status: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  payment_method: string;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: string;
  description?: string;
}
