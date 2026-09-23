/// <reference types="@types/google.maps" />

export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyBUBbI9KS6Xbmmdn65D8hv13hYrWAhwcjU';

export const isGoogleMapsConfigured = (): boolean => {
  return Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 10);
};

// Coordenadas padrão de Imperatriz - MA (Centro / Praça Brasil)
export const IMPERATRIZ_COORDS = {
  latitude: -5.5266,
  longitude: -47.4797,
  zoom: 14,
};

// Fórmula Haversine para calcular distância real em km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Bairros mapeados em Imperatriz - MA para geocodificação local precisa e instantânea
export const IMPERATRIZ_NEIGHBORHOODS: Record<string, { lat: number; lng: number }> = {
  'centro': { lat: -5.5266, lng: -47.4797 },
  'jucara': { lat: -5.5215, lng: -47.4682 },
  'juçara': { lat: -5.5215, lng: -47.4682 },
  'bacuri': { lat: -5.5392, lng: -47.4851 },
  'nova imperatriz': { lat: -5.5180, lng: -47.4580 },
  'beira rio': { lat: -5.5310, lng: -47.4920 },
  'entroncamento': { lat: -5.5080, lng: -47.4650 },
  'maranhao novo': { lat: -5.5150, lng: -47.4720 },
  'maranhão novo': { lat: -5.5150, lng: -47.4720 },
  'vila lobao': { lat: -5.5090, lng: -47.4540 },
  'vila lobão': { lat: -5.5090, lng: -47.4540 },
  'santa rita': { lat: -5.5420, lng: -47.4680 },
  'parque anhanguera': { lat: -5.4980, lng: -47.4550 },
};

// Geocodificação de endereços em Imperatriz - MA
export async function geocodeAddress(addressText: string): Promise<{
  latitude: number;
  longitude: number;
  placeName: string;
}> {
  const norm = addressText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Verifica se corresponde a algum bairro cadastrado de Imperatriz
  for (const [name, coords] of Object.entries(IMPERATRIZ_NEIGHBORHOODS)) {
    const normName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm.includes(normName)) {
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        placeName: `${addressText}, Imperatriz - MA`,
      };
    }
  }

  // Tenta geocodificação via OpenStreetMap Nominatim
  try {
    const query = encodeURIComponent(`${addressText}, Imperatriz, Maranhão, Brasil`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: { 'Accept-Language': 'pt-BR' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          placeName: data[0].display_name || `${addressText}, Imperatriz - MA`,
        };
      }
    }
  } catch (e) {
    console.warn('Geocoding fallback:', e);
  }

  // Fallback baseado em hash para endereços arbitrários em Imperatriz
  let hash = 0;
  for (let i = 0; i < addressText.length; i++) {
    hash = (hash << 5) - hash + addressText.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((hash % 100) / 10000);
  const lngOffset = (((hash >> 2) % 100) / 10000);

  return {
    latitude: IMPERATRIZ_COORDS.latitude + latOffset,
    longitude: IMPERATRIZ_COORDS.longitude + lngOffset,
    placeName: `${addressText}, Imperatriz - MA`,
  };
}
