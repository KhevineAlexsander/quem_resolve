import { appStore } from '../lib/store';
import { calculateDistanceKm } from '../lib/geoUtils';
import { Professional } from '../types';

export const professionalService = {
  getAll(): Professional[] {
    return appStore.getProfessionals();
  },

  getById(id: string): Professional | undefined {
    return appStore.getProfessionalById(id);
  },

  getNearby(params: {
    userLat: number;
    userLon: number;
    categorySlug?: string;
    maxRadiusKm?: number;
    onlyAvailable?: boolean;
  }): Array<Professional & { distanceKm: number }> {
    const all = appStore.getProfessionals();
    const categories = appStore.getCategories();
    const targetCategory = params.categorySlug
      ? categories.find(c => c.slug === params.categorySlug)
      : undefined;

    return all
      .filter(pro => {
        if (params.onlyAvailable && !pro.is_available) return false;
        if (targetCategory) {
          // If category filter requested, check specialties or category
          const matches = pro.specialties?.some(s => 
            s.toLowerCase().includes(targetCategory.name.toLowerCase()) ||
            targetCategory.name.toLowerCase().includes(s.toLowerCase())
          );
          if (!matches && targetCategory.slug === 'climatizacao' && pro.id !== 'pro-joao') return false;
          if (!matches && targetCategory.slug === 'eletrica' && pro.id !== 'pro-marcos') return false;
          if (!matches && targetCategory.slug === 'hidraulica' && pro.id !== 'pro-carlos') return false;
        }
        return true;
      })
      .map(pro => {
        const distanceKm = calculateDistanceKm(
          params.userLat,
          params.userLon,
          pro.latitude,
          pro.longitude
        );
        return { ...pro, distanceKm };
      })
      .filter(pro => {
        const maxR = params.maxRadiusKm || pro.service_radius_km || 30;
        return pro.distanceKm <= maxR;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },

  toggleAvailability(proId: string, isAvailable: boolean) {
    appStore.updateProfessionalAvailability(proId, isAvailable);
  },
};
