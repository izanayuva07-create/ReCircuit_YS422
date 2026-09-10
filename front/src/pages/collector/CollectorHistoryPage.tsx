import React, { useState } from 'react';
import { Banknote, CheckCircle2, History, Layers3, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency, formatDate } from '../../utils/format';

const filters = [{ label: 'All activity', value: 'all' }, { label: 'Pickups', value: 'pickups' }, { label: 'Digital lots', value: 'lots' }, { label: 'Earnings', value: 'earnings' }];

const CollectorHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { bookings, listings, bids, lots, transactions } = usePlatform();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const pickups = bookings.filter((booking) => booking.collectorId === user?.id && booking.status === 'completed');
  const completedLots = lots.filter((lot) => lot.collectorId === user?.id && lot.status === 'processed');
  const earnings = transactions.filter((transaction) => transaction.userId === user?.id && transaction.type === 'earning');
  const empty = (filter === 'pickups' && pickups.length === 0) || (filter === 'lots' && completedLots.length === 0) || (filter === 'earnings' && earnings.length === 0) || (filter === 'all' && pickups.length + completedLots.length + earnings.length === 0);

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader backTo="/collector/profile" eyebrow="Records" title="Activity & earnings" description="Completed pickups, processed lots, and recorded payouts stay available for audit." />
      <FilterBar filters={filters} active={filter} onChange={setFilter} />
      {empty ? <div className="card"><EmptyState icon={History} title="No completed activity" description="Completed pickups and recycler confirmations will appear here." /></div> : (
        <div className="flex flex-col gap-6">
          {(filter === 'all' || filter === 'pickups') && pickups.length > 0 && <section><h2 className="font-semibold mb-3">Completed pickups</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{pickups.map((booking) => { const listing = listings.find((item) => item.id === booking.listingId); const bid = bids.find((item) => item.id === booking.bidId); return <button type="button" key={booking.id} onClick={() => navigate(`/collector/pickups/${booking.id}`)} className="card p-4 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Truck size={19} /></span><span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{listing?.itemName ?? 'Pickup'}</span><span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(booking.scheduledAt, true)}</span></span><span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(bid?.offeredPrice ?? 0)}</span></button>; })}</div></section>}
          {(filter === 'all' || filter === 'lots') && completedLots.length > 0 && <section><h2 className="font-semibold mb-3">Processed lots</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{completedLots.map((lot) => <button type="button" key={lot.id} onClick={() => navigate(`/collector/lots/${lot.id}`)} className="card p-4 text-left flex items-center gap-3"><span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Layers3 size={19} /></span><span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{lot.lotName}</span><span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lot.processedAt ? formatDate(lot.processedAt, true) : formatDate(lot.updatedAt, true)} · {lot.totalWeightKg} kg</span></span><StatusBadge status={lot.status} /></button>)}</div></section>}
          {(filter === 'all' || filter === 'earnings') && earnings.length > 0 && <section><h2 className="font-semibold mb-3">Earnings ledger</h2><div className="card divide-y" style={{ borderColor: 'var(--border)' }}>{earnings.map((transaction) => <div key={transaction.id} className="p-4 flex items-center gap-3"><span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fffbeb', color: '#ca8a04' }}><Banknote size={18} /></span><span className="flex-1 min-w-0"><span className="block text-sm font-medium truncate">{transaction.description}</span><span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(transaction.createdAt, true)}</span></span><span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>+{formatCurrency(transaction.amount)}</span></div>)}</div></section>}
        </div>
      )}
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--primary-subtle)' }}><CheckCircle2 size={20} style={{ color: 'var(--primary)' }} /><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Records are created only by completed lifecycle actions—there are no manually entered payouts.</p></div>
    </div>
  );
};

export default CollectorHistoryPage;
