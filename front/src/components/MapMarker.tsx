import React from 'react';
import { Factory, MapPin, Truck } from 'lucide-react';
import type { LocationKind } from '../data/locations';

interface MapMarkerProps {
  kind: LocationKind;
  label: string;
  x: number;
  y: number;
  active?: boolean;
  onClick?: () => void;
}

const markerStyle: Record<LocationKind, { background: string; color: string; Icon: typeof MapPin }> = {
  source: { background: '#101713', color: '#fff', Icon: MapPin },
  collector: { background: '#0b6b45', color: '#fff', Icon: Truck },
  recycler: { background: '#d9a441', color: '#1d1608', Icon: Factory },
};

const MapMarker: React.FC<MapMarkerProps> = ({ kind, label, x, y, active = false, onClick }) => {
  const { background, color, Icon } = markerStyle[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform hover:scale-105 ${active ? 'scale-105' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={`${label}, ${kind} marker`}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white shadow-lg ${active ? 'status-pulse' : ''}`} style={{ background, color }}><Icon size={17} /></span>
      <span className="mt-1 max-w-28 truncate rounded-md bg-white/92 px-2 py-1 text-[0.62rem] font-bold shadow-sm backdrop-blur-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
    </button>
  );
};

export default MapMarker;
