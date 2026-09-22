import { appStore } from '../lib/store';
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
    return updated;
  },
};
