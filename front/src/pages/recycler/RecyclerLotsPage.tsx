import React, { useMemo, useState } from 'react';
import { Layers3 } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import RecyclerLotCard from './RecyclerLotCard';
import { matchesLotSearch } from './recyclerUtils';

const filters = [{ label: 'All lots', value: 'all' }, { label: 'Needs review', value: 'sent_to_recycler' }, { label: 'Accepted', value: 'accepted' }, { label: 'Received', value: 'received' }, { label: 'Processed', value: 'processed' }, { label: 'Declined', value: 'rejected' }];

const RecyclerLotsPage: React.FC = () => {
  const { user } = useAuth();
  const { lots } = usePlatform();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const relevant = lots.filter((lot) => lot.recyclerId === user?.id || lot.recyclerName === user?.name || (lot.status === 'sent_to_recycler' && !lot.recyclerId));
  const visible = useMemo(() => relevant.filter((lot) => (filter === 'all' || lot.status === filter) && matchesLotSearch(lot, query)), [filter, query, relevant]);
  return <div className="max-container py-7 md:py-9 flex flex-col gap-7"><PageHeader eyebrow="Facility pipeline" title="Digital lots" description="See every lot sent to your facility and its current verification stage." /><section className="card p-4 flex flex-col gap-4"><SearchBar value={query} onChange={setQuery} placeholder="Search lot, collector, item, or location" /><FilterBar filters={filters} active={filter} onChange={setFilter} /></section>{visible.length ? <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{visible.map((lot) => <RecyclerLotCard key={lot.id} lot={lot} />)}</div> : <div className="card"><EmptyState icon={Layers3} title="No lots found" description={relevant.length ? 'Try clearing the search or choosing another stage.' : 'Collector submissions for your facility will appear here.'} actionLabel={relevant.length ? 'Clear filters' : undefined} onAction={relevant.length ? () => { setFilter('all'); setQuery(''); } : undefined} /></div>}</div>;
};

export default RecyclerLotsPage;
