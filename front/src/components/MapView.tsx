import React, { useMemo, useState } from 'react';
import { Info, Layers3 } from 'lucide-react';
import LocationCard from './LocationCard';
import MapMarker from './MapMarker';
import RouteSummary from './RouteSummary';
import CollectorCard from './CollectorCard';
import RecyclerCard from './RecyclerCard';
import type { DemoRouteData, MapLocationData } from '../data/locations';

interface MapViewProps {
  locations: MapLocationData[];
  route?: DemoRouteData;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ locations, route, title = 'Location overview', description = 'Nearby locations and route context', className = '', compact = false }) => {
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? '');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const center = useMemo(() => {
    if (!locations.length) return { lat: 13.0827, lng: 80.2707 };
    return {
      lat: locations.reduce((sum, item) => sum + item.lat, 0) / locations.length,
      lng: locations.reduce((sum, item) => sum + item.lng, 0) / locations.length,
    };
  }, [locations]);
  const markerPositions = useMemo(() => {
    const lats = locations.map((location) => location.lat);
    const lngs = locations.map((location) => location.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    return locations.map((location, index) => ({
      x: locations.length === 1 ? 50 : 18 + ((location.lng - minLng) / lngRange) * 64,
      y: locations.length === 1 ? 50 : 18 + ((maxLat - location.lat) / latRange) * 64,
      fallbackX: [24, 61, 78, 42][index % 4],
      fallbackY: [34, 48, 24, 73][index % 4],
    }));
  }, [locations]);
  const mapUrl = apiKey ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(apiKey)}&center=${center.lat},${center.lng}&zoom=11&maptype=roadmap` : '';

  return (
    <section className={`card overflow-hidden ${className}`} aria-label={title}>
      <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: 'var(--border)' }}>
        <div><span className="eyebrow">Route intelligence</span><h2 className="mt-2 text-lg font-bold tracking-[-0.025em]">{title}</h2><p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold" style={{ backgroundColor: apiKey ? 'var(--primary-subtle)' : '#fff7e6', color: apiKey ? 'var(--primary)' : '#9a610e' }}><Layers3 size={12} />{apiKey ? 'Google Maps configured' : 'Demo map fallback'}</span>
      </div>

      <div className={`relative overflow-hidden ${compact ? 'h-64' : 'h-72 sm:h-80'}`} style={{ backgroundColor: '#e7efe9' }}>
        {apiKey ? (
          <iframe title={`${title} Google Map`} src={mapUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <>
            <div className="absolute inset-0 opacity-65" style={{ backgroundImage: 'linear-gradient(33deg, transparent 46%, rgba(255,255,255,.9) 47%, rgba(255,255,255,.9) 51%, transparent 52%), linear-gradient(115deg, transparent 38%, rgba(255,255,255,.74) 39%, rgba(255,255,255,.74) 43%, transparent 44%), linear-gradient(rgba(11,107,69,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(11,107,69,.08) 1px, transparent 1px)', backgroundSize: '100% 100%, 100% 100%, 38px 38px, 38px 38px' }} />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M24 34 C36 18, 49 64, 61 48 S72 30, 78 24" fill="none" stroke="#0b6b45" strokeWidth="1.2" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" /></svg>
            <div className="absolute left-3 top-3 max-w-[14rem] rounded-xl border bg-white/88 px-3 py-2 text-[0.65rem] leading-4 shadow-sm backdrop-blur-md" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}><span className="mb-0.5 flex items-center gap-1 font-bold" style={{ color: 'var(--text-primary)' }}><Info size={12} />Map ready for configuration</span>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable Google Maps. Demo locations remain usable.</div>
          </>
        )}
        {locations.map((location, index) => <MapMarker key={location.id} kind={location.kind} label={location.name} x={apiKey ? markerPositions[index].x : markerPositions[index].fallbackX} y={apiKey ? markerPositions[index].y : markerPositions[index].fallbackY} active={selectedId === location.id} onClick={() => setSelectedId(location.id)} />)}
      </div>

      <div className="p-4 sm:p-5">
        {route && <RouteSummary route={route} className="mb-4" />}
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">{locations.map((location) => {
          const props = { location, active: selectedId === location.id, onClick: () => setSelectedId(location.id), compact };
          if (location.kind === 'collector') return <CollectorCard key={location.id} {...props} />;
          if (location.kind === 'recycler') return <RecyclerCard key={location.id} {...props} />;
          return <LocationCard key={location.id} {...props} />;
        })}</div>
      </div>
    </section>
  );
};

export default MapView;
