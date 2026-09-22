import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Search, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  ExternalLink
} from 'lucide-react';
import { Professional } from '../types';
import { 
  MAPBOX_ACCESS_TOKEN, 
  isMapboxConfigured, 
  IMPERATRIZ_COORDS, 
  calculateDistanceKm,
  geocodeAddress
} from '../lib/mapbox';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLoc, setUserLoc] = useState(userCoordinates);
  const [hasMapbox, setHasMapbox] = useState(false);

  // SVG interactive fallback map center and zoom for Imperatriz
  const [svgZoom, setSvgZoom] = useState(1);
  const [svgPan, setSvgPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isMapboxConfigured() && mapContainer.current) {
      setHasMapbox(true);
      try {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [userLoc.longitude, userLoc.latitude],
          zoom: IMPERATRIZ_COORDS.zoom,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
        mapRef.current = map;

        // Add user marker
        const userEl = document.createElement('div');
        userEl.className = 'w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold animate-pulse';
        userEl.innerHTML = '📍';
        new mapboxgl.Marker(userEl)
          .setLngLat([userLoc.longitude, userLoc.latitude])
          .addTo(map);

        // Add professional markers
        professionals.forEach(pro => {
          const el = document.createElement('div');
          el.className = 'group cursor-pointer flex flex-col items-center';
          el.innerHTML = `
            <div class="px-2 py-1 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] font-bold flex items-center gap-1 border-2 ${pro.id === selectedProfessionalId ? 'border-orange-500 scale-110' : 'border-slate-700'} transition-transform">
              <span class="w-2 h-2 rounded-full ${pro.is_available ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
              <span>${pro.profile?.full_name?.split(' ')[0] || 'Pro'}</span>
              <span class="text-amber-400">★ ${pro.rating.toFixed(1)}</span>
            </div>
            <div class="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-slate-900 -mt-0.5"></div>
          `;
          el.onclick = () => onSelectProfessional(pro);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([pro.longitude, pro.latitude])
            .addTo(map);
          markersRef.current.push(marker);
        });

        return () => {
          map.remove();
        };
      } catch (err) {
        console.warn('Mapbox init failed, using vector interactive map:', err);
        setHasMapbox(false);
      }
    } else {
      setHasMapbox(false);
    }
  }, [hasMapbox, professionals, selectedProfessionalId]);

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
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [newCoords.longitude, newCoords.latitude],
              zoom: 14,
            });
          }
        },
        () => {
          // Fallback location near Imperatriz Juçara
          const imperatrizJuçara = { latitude: -5.5266, longitude: -47.4797 };
          setUserLoc(imperatrizJuçara);
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
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [newCoords.longitude, newCoords.latitude],
          zoom: 14,
        });
      }
    } finally {
      setIsSearching(false);
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
            placeholder="Buscar bairro ou endereço em Imperatriz..."
            className="w-full bg-slate-900/90 backdrop-blur-md text-white text-xs pl-9 pr-24 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 transition placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-[11px] transition"
          >
            {isSearching ? 'Buscando...' : 'Localizar'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-orange-500/50 text-slate-200 text-xs font-medium transition shadow-md"
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
          onClick={() => setSvgZoom((z) => Math.min(z + 0.3, 2.5))}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition shadow-lg"
          title="Aproximar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSvgZoom((z) => Math.max(z - 0.3, 0.7))}
          className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition shadow-lg"
          title="Afastar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mapbox container or vector interactive map of Imperatriz */}
      {hasMapbox ? (
        <div ref={mapContainer} className="w-full h-full" />
      ) : (
        <div
          className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-[#0d1624]"
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
          {/* Stylized vector map canvas representing Imperatriz - MA with Tocantins river and main avenues */}
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
              {/* Tocantins River */}
              <path
                d="M 120 0 Q 180 180 140 320 T 160 600 L 0 600 L 0 0 Z"
                fill="url(#riverGrad)"
              />
              {/* Avenue Grid representing Av. Bernardo Sayão, Dorgival, Ceará */}
              <path d="M 160 250 L 950 220" stroke="#1e293b" strokeWidth="6" />
              <path d="M 220 120 L 850 520" stroke="#1e293b" strokeWidth="5" />
              <path d="M 380 50 L 420 580" stroke="#334155" strokeWidth="4" />
              <path d="M 550 50 L 600 580" stroke="#334155" strokeWidth="4" />
              <path d="M 720 50 L 760 580" stroke="#1e293b" strokeWidth="5" />
              {/* Secondary streets */}
              <path d="M 280 180 L 850 160" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 290 350 L 920 330" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 300 450 L 920 430" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
              {/* Neighborhood text labels */}
              <text x="60" y="280" fill="#38bdf8" fontSize="12" fontWeight="600" opacity="0.7">Rio Tocantins</text>
              <text x="260" y="240" fill="#64748b" fontSize="11" fontWeight="600">Beira Rio</text>
              <text x="440" y="210" fill="#94a3b8" fontSize="13" fontWeight="bold">Centro</text>
              <text x="580" y="320" fill="#64748b" fontSize="11" fontWeight="600">Juçara</text>
              <text x="420" y="420" fill="#64748b" fontSize="11" fontWeight="600">Bacuri</text>
              <text x="700" y="260" fill="#64748b" fontSize="11" fontWeight="600">Nova Imperatriz</text>
            </svg>

            {/* Client Position Marker (Blue Pulse) */}
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
              // Normalized offsets for Imperatriz map visualization
              const offsets = [
                { left: '60%', top: '42%' }, // João Silva (Climatização - Juçara)
                { left: '68%', top: '56%' }, // Marcos (Elétrica - Nova Imperatriz)
                { left: '46%', top: '38%' }, // Carlos (Hidráulica - Centro)
                { left: '42%', top: '58%' }, // Ana (Bacuri)
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

          {/* Map branding / indicator */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Imperatriz - MA • GPS Ativo</span>
          </div>
        </div>
      )}
    </div>
  );
};
