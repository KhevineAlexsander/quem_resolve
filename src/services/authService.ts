import { appStore } from '../lib/store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';

export const authService = {
  getCurrentUser(): Profile {
    return appStore.getCurrentUser();
  },

  async login(email: string, _password: string): Promise<Profile> {
    const client = getSupabase();
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password: _password,
        });
        if (!error && data.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
          if (profile) {
            appStore.setCurrentUser(profile);
            return profile;
          }
        }
      } catch (err) {
        console.warn('Supabase login tentado, usando perfil:', err);
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

    if (isSupabaseConfigured() && client) {
      client.from('profiles').upsert({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
      }, { onConflict: 'id' }).then(() => {}, () => {});
    }

    return profile;
  },

  async register(params: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    role: UserRole;
  }): Promise<Profile> {
    const client = getSupabase();
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: params.email,
          password: params.password || 'senha123456',
        });

        if (!error && data.user) {
          const newProfile: Profile = {
            id: 'prof-' + Date.now(),
            user_id: data.user.id,
            full_name: params.fullName,
            email: params.email,
            phone: params.phone || '(99) 98000-0000',
            avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
            role: params.role,
            created_at: new Date().toISOString(),
          };
          
          await client.from('profiles').upsert(newProfile, { onConflict: 'id' });
          appStore.setCurrentUser(newProfile);
          return newProfile;
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

    if (isSupabaseConfigured() && client) {
      client.from('profiles').upsert(newProfile, { onConflict: 'id' }).then(() => {}, () => {});
    }

    return newProfile;
  },

  async logout(): Promise<void> {
    const client = getSupabase();
    if (isSupabaseConfigured() && client) {
      await client.auth.signOut().then(() => {}, () => {});
    }
  },

  switchRole(role: UserRole) {
    appStore.switchRole(role);
  },

  setUser(profile: Profile) {
    appStore.setCurrentUser(profile);
    const client = getSupabase();
    if (isSupabaseConfigured() && client) {
      client.from('profiles').upsert(profile, { onConflict: 'id' }).then(() => {}, () => {});
    }
  },
};
