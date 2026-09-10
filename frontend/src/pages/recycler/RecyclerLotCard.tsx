import React from 'react';
import { CalendarDays, IndianRupee, MapPin, Package, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import type { DigitalLot } from '../../types';
import { formatCurrency, formatDate } from './recyclerUtils';

interface RecyclerLotCardProps {
  lot: DigitalLot;
  actions?: React.ReactNode;
  compact?: boolean;
}

const RecyclerLotCard: React.FC<RecyclerLotCardProps> = ({ lot, actions, compact = false }) => {
  const navigate = useNavigate();

  return (
    <article className="card p-4 md:p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Lot #{lot.id}
          </p>
          <h2 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{lot.lotName}</h2>
        </div>
        <StatusBadge status={lot.status} />
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          <Package size={15} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {lot.totalQuantity} item{lot.totalQuantity === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Scale size={15} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{lot.totalWeightKg} kg</span>
        </div>
        {!compact && (
          <div className="flex items-center gap-2 min-w-0">
            <IndianRupee size={15} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(lot.estimatedValue)}</span>
          </div>
        )}
        {!compact && (
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={15} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{formatDate(lot.updatedAt)}</span>
          </div>
        )}
      </div>

      {lot.storageLocation && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
          <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{lot.storageLocation}</span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={() => navigate(`/recycler/lots/${lot.id}`)}>
          View details
        </Button>
        {actions}
      </div>
    </article>
  );
};

export default RecyclerLotCard;
