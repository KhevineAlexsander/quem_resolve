/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Search, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Professional } from '../types';
import { 
  GOOGLE_MAPS_API_KEY,
  isGoogleMapsConfigured, 
  IMPERATRIZ_COORDS, 
  calculateDistanceKm,
  geocodeAddress,
  loadGoogleMaps,
  GOOGLE_MAPS_DARK_STYLE
} from '../lib/googleMaps';

interface MapViewProps {
  professionals: Professional[];
  selectedProfessionalId?: string;
  onSelectProfessional: (pro: Professional) => void;
  userCoordinates?: { latitude: number; longitude: number };
  onUserCoordinatesChange?: (coords: { latitude: number; longitude: number }) => void;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  professionals,
  selectedProfessionalId,
  onSelectProfessional,
  userCoordinates = { latitude: IMPERATRIZ_COORDS.latitude, longitude: IMPERATRIZ_COORDS.longitude },
  onUserCoordinatesChange,
  heightClass = 'h-[460px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLoc, setUserLoc] = useState(userCoordinates);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // SVG interactive fallback map center and zoom for Imperatriz
  const [svgZoom, setSvgZoom] = useState(1);
  const [svgPan, setSvgPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    async function initGoogleMap() {
      if (!mapContainerRef.current) return;

      try {
        const g = await loadGoogleMaps();
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = new g.maps.Map(mapContainerRef.current, {
            center: { lat: userLoc.latitude, lng: userLoc.longitude },
            zoom: IMPERATRIZ_COORDS.zoom,
            styles: GOOGLE_MAPS_DARK_STYLE,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new g.maps.InfoWindow();
        }

        setMapLoaded(true);
        setLoadError(null);
      } catch (err: any) {
        console.warn('Google Maps load notice:', err);
        setLoadError(err?.message || 'Erro ao carregar Google Maps');
        setMapLoaded(false);
      }
    }

    initGoogleMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update markers when professionals or selectedProfessionalId change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window === 'undefined' || !(window as any).google) return;
    const g = (window as any).google as typeof google;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // User Location Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    userMarkerRef.current = new g.maps.Marker({
      position: { lat: userLoc.latitude, lng: userLoc.longitude },
      map: map,
      title: 'Sua Localização',
      icon: {
        path: g.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 999,
    });

    // Professional Markers
    professionals.forEach((pro) => {
      const isSelected = pro.id === selectedProfessionalId;
      const dist = calculateDistanceKm(userLoc.latitude, userLoc.longitude, pro.latitude, pro.longitude);

      const marker = new g.maps.Marker({
        position: { lat: pro.latitude, lng: pro.longitude },
        map: map,
        title: `${pro.profile?.full_name} (${pro.rating}★)`,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: isSelected ? '#f97316' : '#ea580c',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 1.5,
          scale: isSelected ? 1.8 : 1.4,
          anchor: new g.maps.Point(12, 22),
        },
        zIndex: isSelected ? 100 : 10,
      });

      marker.addListener('click', () => {
        onSelectProfessional(pro);

        if (infoWindowRef.current) {
          const contentString = `
            <div style="color: #0f172a; padding: 6px; font-family: system-ui, sans-serif; min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <img src="${pro.profile?.avatar_url || ''}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                <div>
                  <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${pro.profile?.full_name || 'Profissional'}</div>
                  <div style="font-size: 10px; color: #ea580c; font-weight: 600;">★ ${pro.rating.toFixed(1)} • ${pro.total_services || 0} serviços</div>
                </div>
              </div>
              <div style="font-size: 11px; color: #475569; margin: 4px 0;">📍 Aprox. <strong>${dist} km</strong> de você</div>
              <div style="font-size: 10px; color: #16a34a; font-weight: 700; margin-top: 2px;">● Online em Imperatriz</div>
            </div>
          `;
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }, [mapLoaded, professionals, selectedProfessionalId, userLoc]);

  // Center on selected professional if changed
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedProfessionalId) return;
    const selected = professionals.find((p) => p.id === selectedProfessionalId);
    if (selected) {
      mapInstanceRef.current.panTo({ lat: selected.latitude, lng: selected.longitude });
    }
  }, [selectedProfessionalId, mapLoaded, professionals]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserLoc(newCoords);
          if (onUserCoordinatesChange) {
            onUserCoordinatesChange(newCoords);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: newCoords.latitude, lng: newCoords.longitude });
            mapInstanceRef.current.setZoom(15);
          }
        },
        () => {
          const imperatrizCentro = { latitude: -5.5266, longitude: -47.4797 };
          setUserLoc(imperatrizCentro);
        }
      );
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      const newCoords = { latitude: result.latitude, longitude: result.longitude };
      setUserLoc(newCoords);
      if (onUserCoordinatesChange) {
        onUserCoordinatesChange(newCoords);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: newCoords.latitude, lng: newCoords.longitude });
        mapInstanceRef.current.setZoom(15);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 14;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    } else {
      setSvgZoom((z) => Math.min(z + 0.3, 2.5));
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 14;
      mapInstanceRef.current.setZoom(currentZoom - 1);
    } else {
      setSvgZoom((z) => Math.max(z - 0.3, 0.7));
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 select-none`}>
      {/* Search & Location Bar */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-96 z-20 flex flex-col gap-2">
        <form onSubmit={handleSearchAddress} className="relative flex items-center shadow-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar bairro em Imperatriz (Juçara, Bacuri, Centro...)"
            className="w-full bg-slate-900/90 backdrop-blur-md text-white text-xs pl-9 pr-24 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-[11px] transition cursor-pointer"
          >
            {isSearching ? 'Buscando...' : 'Localizar'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-orange-500/50 text-slate-200 text-xs font-medium transition shadow-md cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-orange-400" />
            <span>Usar minha localização</span>
          </button>

          <span className="text-[11px] bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 font-medium">
            📍 Imperatriz - MA
          </span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition shadow-lg cursor-pointer"
          title="Aproximar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition shadow-lg cursor-pointer"
          title="Afastar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Google Maps Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback stylized visual map for Imperatriz if Google Maps is still loading */}
      {!mapLoaded && (
        <div
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-[#0d1624]"
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX - svgPan.x, y: e.clientY - svgPan.y });
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              setSvgPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div
            className="absolute inset-0 transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${svgPan.x}px, ${svgPan.y}px) scale(${svgZoom})`,
            }}
          >
            {/* Rio Tocantins curve on the west side */}
            <svg className="w-full h-full absolute inset-0 opacity-40 pointer-events-none" viewBox="0 0 1000 600">
              <defs>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d="M 120 0 Q 180 180 140 320 T 160 600 L 0 600 L 0 0 Z"
                fill="url(#riverGrad)"
              />
              <path d="M 160 250 L 950 220" stroke="#1e293b" strokeWidth="6" />
              <path d="M 220 120 L 850 520" stroke="#1e293b" strokeWidth="5" />
              <path d="M 380 50 L 420 580" stroke="#334155" strokeWidth="4" />
              <path d="M 550 50 L 600 580" stroke="#334155" strokeWidth="4" />
              <path d="M 720 50 L 760 580" stroke="#1e293b" strokeWidth="5" />
              <text x="60" y="280" fill="#38bdf8" fontSize="12" fontWeight="600" opacity="0.7">Rio Tocantins</text>
              <text x="260" y="240" fill="#64748b" fontSize="11" fontWeight="600">Beira Rio</text>
              <text x="440" y="210" fill="#94a3b8" fontSize="13" fontWeight="bold">Centro</text>
              <text x="580" y="320" fill="#64748b" fontSize="11" fontWeight="600">Juçara</text>
              <text x="420" y="420" fill="#64748b" fontSize="11" fontWeight="600">Bacuri</text>
              <text x="700" y="260" fill="#64748b" fontSize="11" fontWeight="600">Nova Imperatriz</text>
            </svg>

            {/* Client Position Marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: '52%', top: '48%' }}
            >
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute inset-0"></div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
                  📍
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Você está aqui
                </div>
              </div>
            </div>

            {/* Professional Markers */}
            {professionals.map((pro, index) => {
              const offsets = [
                { left: '60%', top: '42%' },
                { left: '68%', top: '56%' },
                { left: '46%', top: '38%' },
                { left: '42%', top: '58%' },
              ];
              const pos = offsets[index % offsets.length];
              const isSelected = pro.id === selectedProfessionalId;
              const dist = calculateDistanceKm(userLoc.latitude, userLoc.longitude, pro.latitude, pro.longitude);

              return (
                <div
                  key={pro.id}
                  onClick={() => onSelectProfessional(pro)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <div className={`flex flex-col items-center transition-transform duration-200 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'}`}>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-xl border-2 backdrop-blur-md ${isSelected ? 'bg-orange-500 text-slate-950 border-white font-extrabold' : 'bg-slate-900/95 text-white border-slate-700 hover:border-orange-500'}`}>
                      <img
                        src={pro.profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={pro.profile?.full_name}
                        className="w-5 h-5 rounded-full object-cover border border-orange-400"
                      />
                      <div className="text-left leading-tight">
                        <div className="text-[11px] font-bold truncate max-w-[90px]">
                          {pro.profile?.full_name?.split(' ')[0]}
                        </div>
                        <div className="text-[9px] flex items-center gap-1 opacity-90">
                          <span className="text-amber-400">★ {pro.rating.toFixed(1)}</span>
                          <span>• {dist} km</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${isSelected ? 'border-t-orange-500' : 'border-t-slate-900'} -mt-0.5`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Google Maps Status Tag */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-white">Google Maps</span>
        <span className="text-slate-400">• Imperatriz - MA</span>
      </div>
    </div>
  );
};
