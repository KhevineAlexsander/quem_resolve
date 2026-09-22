import { appStore } from '../lib/store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';

export const authService = {
  getCurrentUser(): Profile {
    return appStore.getCurrentUser();
  },

  async login(email: string, _password: string): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          if (profile) {
            appStore.setCurrentUser(profile);
            return profile;
          }
        }
      } catch (err) {
        console.warn('Supabase login failed, using local profile:', err);
      }
    }

    // Local profile fallback
    const all = [
      ...appStore.getProfessionals().map(p => p.profile).filter(Boolean) as Profile[],
      appStore.getCurrentUser(),
    ];
    const match = all.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (match) {
      appStore.setCurrentUser(match);
      return match;
    }

    // Default or newly created profile
    const profile: Profile = {
      id: 'prof-' + Date.now(),
      user_id: 'usr-' + Date.now(),
      full_name: email.split('@')[0],
      email,
      role: 'CLIENTE',
      created_at: new Date().toISOString(),
    };
    appStore.setCurrentUser(profile);
    return profile;
  },

  async register(params: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    role: UserRole;
  }): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password || 'senha123456',
        });
        if (error) throw error;

        if (data.user) {
          const newProfile: Omit<Profile, 'id'> = {
            user_id: data.user.id,
            full_name: params.fullName,
            email: params.email,
            phone: params.phone,
            role: params.role,
            created_at: new Date().toISOString(),
          };
          const { data: created, error: pErr } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
          if (pErr) throw pErr;
          if (created) {
            appStore.setCurrentUser(created);
            return created;
          }
        }
      } catch (err) {
        console.warn('Supabase register error:', err);
      }
    }

    const newProfile: Profile = {
      id: 'prof-' + Date.now(),
      user_id: 'usr-' + Date.now(),
      full_name: params.fullName,
      email: params.email,
      phone: params.phone || '(99) 98000-0000',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: params.role,
      created_at: new Date().toISOString(),
    };
    appStore.setCurrentUser(newProfile);
    return newProfile;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  },

  switchRole(role: UserRole) {
    appStore.switchRole(role);
  },

  setUser(profile: Profile) {
    appStore.setCurrentUser(profile);
  },
};
