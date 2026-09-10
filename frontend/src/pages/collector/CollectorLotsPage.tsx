import React, { useMemo, useState } from 'react';
import { ArrowRight, Layers3, PackageOpen, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency, formatDate } from '../../utils/format';

const filters = [
  { label: 'All lots', value: 'all' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'In progress', value: 'progress' },
  { label: 'Completed', value: 'processed' },
];

const CollectorLotsPage: React.FC = () => {
  const { user } = useAuth();
  const { lots, inventory } = usePlatform();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const myLots = lots.filter((lot) => !user?.id || lot.collectorId === user.id);
  const availableItems = inventory.filter((item) => (!user?.id || item.collectorId === user.id) && !item.lotId);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return myLots.filter((lot) => {
      if (filter === 'preparing' && !['draft', 'ready', 'rejected'].includes(lot.status)) return false;
      if (filter === 'progress' && !['sent_to_recycler', 'accepted', 'received'].includes(lot.status)) return false;
      if (filter === 'processed' && lot.status !== 'processed') return false;
      return !normalized || `${lot.lotName} ${lot.id} ${lot.recyclerName ?? ''} ${lot.storageLocation ?? ''}`.toLowerCase().includes(normalized);
    });
  }, [filter, myLots, query]);

  const totalWeight = myLots.reduce((sum, lot) => sum + lot.totalWeightKg, 0);
  const completedWeight = myLots.filter((lot) => lot.status === 'processed').reduce((sum, lot) => sum + lot.totalWeightKg, 0);

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader
        eyebrow="Traceable aggregation"
        title="Digital lots"
        description="Bundle sorted inventory and hand it to a verified recycler with a complete digital trail."
        actions={<Link to="/collector/lots/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}><Plus size={17} /> Create lot</Link>}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total lots" value={myLots.length} icon="Layers3" />
        <StatCard label="In recycler flow" value={myLots.filter((lot) => ['sent_to_recycler', 'accepted', 'received'].includes(lot.status)).length} icon="Truck" color="#2563eb" />
        <StatCard label="Processed weight" value={completedWeight.toFixed(1)} unit="kg" icon="Recycle" color="#0f766e" />
        <StatCard label="All lot value" value={formatCurrency(myLots.reduce((sum, lot) => sum + lot.estimatedValue, 0))} icon="IndianRupee" color="#ca8a04" />
      </section>

      <section className="card p-4 flex flex-col gap-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search lots, recycler, or storage location" />
        <FilterBar filters={filters} active={filter} onChange={setFilter} />
      </section>

      {visible.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((lot) => (
            <button type="button" key={lot.id} onClick={() => navigate(`/collector/lots/${lot.id}`)} className="card p-5 text-left flex flex-col gap-4 hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Layers3 size={20} /></div><StatusBadge status={lot.status} /></div>
              <div><h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{lot.lotName}</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{lot.id} · Created {formatDate(lot.createdAt)}</p></div>
              <div className="grid grid-cols-3 gap-2 rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
                <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Records</p><p className="text-sm font-semibold mt-0.5">{lot.items.length}</p></div>
                <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Weight</p><p className="text-sm font-semibold mt-0.5">{lot.totalWeightKg.toFixed(1)} kg</p></div>
                <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Value</p><p className="text-sm font-semibold mt-0.5">{formatCurrency(lot.estimatedValue)}</p></div>
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto"><span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{lot.recyclerName ?? lot.storageLocation ?? 'Recycler not selected'}</span><ArrowRight size={16} style={{ color: 'var(--primary)' }} /></div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={PackageOpen} title="No digital lots found" description={myLots.length ? 'Try another search or status filter.' : 'Select available inventory to create your first traceable lot.'} actionLabel={myLots.length ? 'Clear filters' : 'Create a lot'} onAction={() => { if (myLots.length) { setQuery(''); setFilter('all'); } else navigate('/collector/lots/new'); }} />
      )}

      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{availableItems.length} unassigned inventory record{availableItems.length === 1 ? '' : 's'} · {totalWeight.toFixed(1)} kg recorded across lots</p>
    </div>
  );
};

export default CollectorLotsPage;
