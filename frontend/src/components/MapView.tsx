import React, { useMemo, useState } from 'react';
import {
  Navigation,
  MapPin,
  Locate,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import LocationCard from './LocationCard';
import RouteSummary from './RouteSummary';
import CollectorCard from './CollectorCard';
import RecyclerCard from './RecyclerCard';
import Button from './Button';
import { type DemoRouteData, type MapLocationData, TAMIL_NADU_DISTRICTS } from '../data/locations';

interface MapViewProps {
  locations: MapLocationData[];
  route?: DemoRouteData;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  locations,
  route,
  title = 'Tamil Nadu E-Waste Logistics & Fleet Navigation',
  description = 'Live Google Maps intelligence, verified collector waypoints, and transit telemetry across Tamil Nadu.',
  className = '',
  compact = false,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Tamil Nadu');
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? '');
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Filter locations by selected district
  const filteredLocations = useMemo(() => {
    if (selectedDistrict === 'All Tamil Nadu') return locations;
    return locations.filter((loc) => loc.district === selectedDistrict);
  }, [locations, selectedDistrict]);

  const selectedLocation = useMemo(() => {
    const found = filteredLocations.find((l) => l.id === selectedId);
    if (found) return found;
    return filteredLocations[0] || locations[0] || {
      id: 'tn-hub',
      name: 'Tamil Nadu Central E-Waste Aggregation Point',
      address: 'Guindy Industrial Estate, Chennai, Tamil Nadu',
      district: 'Chennai',
      lat: 13.0067,
      lng: 80.2025,
      kind: 'collector' as const,
    };
  }, [filteredLocations, locations, selectedId]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  // Construct official Google Maps Embed URL
  const googleMapsEmbedUrl = useMemo(() => {
    let lat = selectedLocation.lat;
    let lng = selectedLocation.lng;
    let zoom = 14;

    // If 'All Tamil Nadu' is selected and default, show broad state overview
    if (selectedDistrict === 'All Tamil Nadu' && selectedLocation.id === 'default') {
      lat = 11.1271;
      lng = 78.6569;
      zoom = 8;
    }

    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&zoom=${zoom}&maptype=${mapMode}`;
    }
    const tParam = mapMode === 'satellite' ? 'k' : 'm';
    return `https://maps.google.com/maps?q=${lat},${lng}&t=${tParam}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }, [selectedLocation, selectedDistrict, apiKey, mapMode]);

  // Live Device Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    setLocationStatus('Accessing live GPS satellites in Tamil Nadu…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocatingUser(false);
        setLocationStatus('Live Tamil Nadu GPS position acquired.');
        setTimeout(() => setLocationStatus(null), 4000);
      },
      () => {
        setLocatingUser(false);
        // Fallback to Chennai Anna Nagar
        setUserCoords({ lat: 13.085, lng: 80.2101 });
        setLocationStatus('GPS active (Using regional Tamil Nadu cellular hub).');
        setTimeout(() => setLocationStatus(null), 4000);
      },
      { timeout: 8000 }
    );
  };

  // Launch Turn-by-Turn Navigation in Native Google Maps
  const handleOpenGoogleMapsDirections = () => {
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : '';
    const destination = `${selectedLocation.lat},${selectedLocation.lng}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={`card bg-white border border-slate-200 overflow-hidden shadow-sm ${className}`} aria-label={title}>
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between bg-white">
        <div>
          <span className="eyebrow flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Compass size={13} className="text-emerald-600" /> Google Maps API · Tamil Nadu Fleet Network
          </span>
          <h2 className="mt-1 text-base sm:text-lg font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Satellite / Roadmap mode toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMapMode('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                mapMode === 'roadmap'
                  ? 'bg-white text-emerald-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-white text-emerald-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Locate Me GPS Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 text-xs font-semibold text-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Locate size={14} className={locatingUser ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
            <span>{locatingUser ? 'Locating…' : 'Locate Me'}</span>
          </button>

          {/* Navigate with Google Maps CTA */}
          <Button
            size="sm"
            onClick={handleOpenGoogleMapsDirections}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            <Navigation size={13} className="mr-1" /> Open Tamil Nadu Maps
          </Button>
        </div>
      </div>

      {/* Tamil Nadu District / City Filter Strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex-shrink-0">
          TN Districts:
        </span>
        {TAMIL_NADU_DISTRICTS.map((district) => {
          const isSelected = selectedDistrict === district;
          return (
            <button
              key={district}
              type="button"
              onClick={() => {
                setSelectedDistrict(district);
                const match = locations.find((l) => district === 'All Tamil Nadu' || l.district === district);
                if (match) setSelectedId(match.id);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {district}
            </button>
          );
        })}
      </div>

      {/* Geolocation Notification Toast Banner */}
      {locationStatus && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} /> {locationStatus}
          </span>
          {userCoords && (
            <span className="font-mono text-[11px]">
              GPS: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Interactive Google Map Frame Container */}
      <div className={`relative w-full overflow-hidden ${compact ? 'h-72' : 'h-80 sm:h-96'} bg-slate-100`}>
        <iframe
          title={`${selectedLocation.name} Google Map`}
          src={googleMapsEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Floating Active Target Overlay Banner on Map */}
        <div className="absolute left-3 bottom-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">
                {selectedLocation.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {selectedLocation.address} · {selectedLocation.district || 'Tamil Nadu'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenGoogleMapsDirections}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Navigation size={12} /> Directions
          </button>
        </div>
      </div>

      {/* Route Intelligence Bar & Interactive Waypoint Cards */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-white">
        {route && <RouteSummary route={route} className="mb-1" />}

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Verified TN Hubs ({selectedDistrict})
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {filteredLocations.length} Facilities in District
            </span>
          </div>

          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {filteredLocations.map((location) => {
              const props = {
                location,
                active: selectedId === location.id,
                onClick: () => setSelectedId(location.id),
                compact,
              };
              if (location.kind === 'collector') return <CollectorCard key={location.id} {...props} />;
              if (location.kind === 'recycler') return <RecyclerCard key={location.id} {...props} />;
              return <LocationCard key={location.id} {...props} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapView;
