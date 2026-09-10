import React from 'react';
import type { WasteListing } from '../types';
import { MapPin, Weight, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

interface WasteCardProps {
  listing: WasteListing;
  role?: 'source' | 'collector';
  onBid?: (id: string) => void;
}

const categoryLabel: Record<string, string> = {
  mobile: 'Mobile', laptop: 'Laptop', desktop: 'Desktop', tablet: 'Tablet',
  battery: 'Battery', pcb: 'PCB', cable: 'Cable', appliance: 'Appliance',
  tv_monitor: 'TV/Monitor', printer: 'Printer', other: 'Other',
};

const WasteCard: React.FC<WasteCardProps> = ({ listing, role = 'source', onBid }) => {
  const navigate = useNavigate();

  return (
    <div className="card group p-4 flex flex-col gap-3">
      {/* Image placeholder */}
      <div
        className="rounded-xl w-full h-32 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--primary-subtle)' }}
      >
        {listing.images[0] ? (
          <img src={listing.images[0]} alt={listing.itemName} loading="lazy" className="image-zoom w-full h-full object-cover" />
        ) : (
          <Package size={36} style={{ color: 'var(--primary)' }} />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{listing.itemName}</p>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{categoryLabel[listing.category]}</span>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Package size={12} /> {listing.quantity} item{listing.quantity > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Weight size={12} /> {listing.weightKg} kg
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <MapPin size={12} /> {listing.pickupAddress.split(',').slice(-2).join(',').trim()}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>₹{listing.expectedPrice}</span>
        {role === 'collector' && onBid ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/collector/job/${listing.id}`)}>Details</Button>
            <Button size="sm" onClick={() => onBid(listing.id)}>Bid</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate(`/source/listing/${listing.id}`)}>View</Button>
        )}
      </div>
    </div>
  );
};

export default WasteCard;
