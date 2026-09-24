import { appStore } from '../lib/store';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

export const profileService = {
  getCurrentProfile(): Profile {
    return appStore.getCurrentUser();
  },

  updateProfile(updates: Partial<Profile>): Profile {
    const current = appStore.getCurrentUser();
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    appStore.setCurrentUser(updated);

    const client = getSupabase();
    if (isSupabaseConfigured() && client) {
      client.from('profiles').upsert({
        id: updated.id,
        user_id: updated.user_id,
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone || null,
        avatar_url: updated.avatar_url || null,
        role: updated.role,
        updated_at: updated.updated_at,
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.warn('Falha ao atualizar perfil no Supabase:', error);
      });
    }

    return updated;
  },
};
