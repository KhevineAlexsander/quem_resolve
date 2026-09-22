export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

export const isMapboxConfigured = (): boolean => {
  return Boolean(MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN.startsWith('pk.'));
};

// Coordenadas padrão do centro de Imperatriz - MA
export const IMPERATRIZ_COORDS = {
  latitude: -5.5266,
  longitude: -47.4797,
  zoom: 13.5,
};

// Fórmula Haversine para calcular distância real em km entre dois pontos geográficos
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

// Geocodificação de endereços em Imperatriz - MA (Mapbox Geocoding API ou resolução local instantânea)
export async function geocodeAddress(addressText: string): Promise<{
  latitude: number;
  longitude: number;
  placeName: string;
}> {
  if (isMapboxConfigured()) {
    try {
      const query = encodeURIComponent(`${addressText}, Imperatriz - MA, Brasil`);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_ACCESS_TOKEN}&proximity=${IMPERATRIZ_COORDS.longitude},${IMPERATRIZ_COORDS.latitude}&country=br&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].center;
          return {
            latitude: lat,
            longitude: lon,
            placeName: data.features[0].place_name,
          };
        }
      }
    } catch (e) {
      console.warn('Mapbox Geocoding fetch error, using local coordinates:', e);
    }
  }

  // Offset inteligente baseado no hash do endereço para simulação realista em Imperatriz
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
