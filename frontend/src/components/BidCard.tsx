import React from 'react';
import type { Bid } from '../types';
import { Star, MapPin, Clock, Truck, CheckCircle } from 'lucide-react';
import Button from './Button';
import StatusBadge from './StatusBadge';

interface BidCardProps {
  bid: Bid;
  onAccept?: (bidId: string) => void;
  onViewProfile?: (collectorId: string) => void;
  showActions?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({ bid, onAccept, onViewProfile, showActions = true }) => (
  <div className="card p-4 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{bid.collectorName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star size={12} fill="var(--warning)" stroke="none" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {bid.collectorRating} · {bid.collectorCompletedPickups} pickups
          </span>
        </div>
      </div>
      <StatusBadge status={bid.status} />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-center gap-1.5">
        <MapPin size={13} style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bid.distanceKm} km away</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={13} style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>~{bid.estimatedArrivalMins} min ETA</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Truck size={13} style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bid.collectorCompletedPickups} completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle size={13} style={{ color: 'var(--primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>₹{bid.offeredPrice}</span>
      </div>
    </div>

    {bid.notes && (
      <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>"{bid.notes}"</p>
    )}

    {showActions && bid.status === 'pending' && (
      <div className="flex gap-2 mt-1">
        {onViewProfile && (
          <Button variant="outline" size="sm" onClick={() => onViewProfile(bid.collectorId)} className="flex-1">
            View Profile
          </Button>
        )}
        {onAccept && (
          <Button size="sm" onClick={() => onAccept(bid.id)} className="flex-1">
            Accept Bid
          </Button>
        )}
      </div>
    )}
  </div>
);

export default BidCard;
