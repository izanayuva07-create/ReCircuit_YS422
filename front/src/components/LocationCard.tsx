import React from 'react';
import { BadgeCheck, Clock3, Factory, IndianRupee, MapPin, Star, Truck } from 'lucide-react';
import type { MapLocationData } from '../data/locations';

export interface LocationCardProps {
  location: MapLocationData;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const kindIcon = { source: MapPin, collector: Truck, recycler: Factory };

const LocationCard: React.FC<LocationCardProps> = ({ location, active = false, onClick, compact = false }) => {
  const Icon = kindIcon[location.kind];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[15.5rem] flex-1 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${active ? 'shadow-md' : ''}`}
      style={{ borderColor: active ? 'var(--primary-light)' : 'var(--border)', backgroundColor: active ? 'var(--primary-subtle)' : 'var(--surface)' }}
      aria-pressed={active}
    >
      <span className="flex items-start gap-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl" style={{ backgroundColor: location.kind === 'recycler' ? '#fff5da' : 'var(--primary-subtle)', color: location.kind === 'source' ? 'var(--text-primary)' : 'var(--primary)' }}><Icon size={17} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-bold"><span className="truncate">{location.name}</span>{location.authorized && <BadgeCheck size={15} className="flex-none" style={{ color: 'var(--primary)' }} />}</span>
          <span className="mt-0.5 block truncate text-[0.68rem]" style={{ color: 'var(--text-secondary)' }}>{location.detail ?? location.address}</span>
        </span>
      </span>
      {!compact && <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {location.distance && <span className="inline-flex items-center gap-1"><MapPin size={11} />{location.distance}</span>}
        {location.eta && <span className="inline-flex items-center gap-1"><Clock3 size={11} />{location.eta}</span>}
        {location.rating && <span className="inline-flex items-center gap-1"><Star size={11} fill="currentColor" />{location.rating}</span>}
        {location.offer && <span className="inline-flex items-center gap-0.5"><IndianRupee size={11} />{location.offer} offer</span>}
      </span>}
      {location.accepts && <span className="mt-2 block text-[0.65rem] font-semibold" style={{ color: 'var(--primary)' }}>Accepts {location.accepts.join(' + ')}</span>}
    </button>
  );
};

export default LocationCard;
