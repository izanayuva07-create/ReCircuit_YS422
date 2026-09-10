import React, { useMemo, useState } from 'react';
import { Download, History, Recycle } from 'lucide-react';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import StatCard from '../../components/StatCard';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import RecyclerLotCard from './RecyclerLotCard';
import { formatCurrency, matchesLotSearch } from './recyclerUtils';

const RecyclerHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { lots } = usePlatform();
  const [query, setQuery] = useState('');
  const processed = lots.filter((lot) => lot.status === 'processed' && (lot.recyclerId === user?.id || lot.recyclerName === user?.name));
  const visible = useMemo(() => processed.filter((lot) => matchesLotSearch(lot, query)), [processed, query]);
  const weight = processed.reduce((sum, lot) => sum + lot.totalWeightKg, 0);
  const items = processed.reduce((sum, lot) => sum + lot.totalQuantity, 0);

  const downloadReport = () => {
    if (!processed.length) return showToast('There are no processed records to export.', 'info');
    const rows = [['Lot ID', 'Lot name', 'Collector', 'Items', 'Weight kg', 'Estimated value INR', 'Processed at'], ...processed.map((lot) => [lot.id, lot.lotName, lot.collectorId, String(lot.totalQuantity), String(lot.totalWeightKg), String(lot.estimatedValue), lot.processedAt ?? lot.updatedAt])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `re-circuit-processing-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
    showToast('Processing report downloaded.', 'success');
  };

  return <div className="max-container py-7 md:py-9 flex flex-col gap-7"><PageHeader eyebrow="Audit trail" title="Processing history" description="Completed recycling records remain available for reporting and chain-of-custody checks." actions={<Button variant="outline" leftIcon={<Download size={16} />} onClick={downloadReport}>Export CSV</Button>} /><section className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard label="Processed lots" value={processed.length} icon="FileCheck2" /><StatCard label="Processed units" value={items} icon="PackageCheck" color="#2563eb" /><StatCard label="Diverted weight" value={weight.toFixed(1)} unit="kg" icon="Recycle" /><StatCard label="Recorded material value" value={formatCurrency(processed.reduce((sum, lot) => sum + lot.estimatedValue, 0))} icon="IndianRupee" color="#ca8a04" /></section><SearchBar value={query} onChange={setQuery} placeholder="Search completed lots" />{visible.length ? <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{visible.map((lot) => <RecyclerLotCard key={lot.id} lot={lot} />)}</div> : <div className="card"><EmptyState icon={processed.length ? History : Recycle} title={processed.length ? 'No records match' : 'No processed lots yet'} description={processed.length ? 'Try a different search.' : 'Lots appear here after receipt and responsible processing are confirmed.'} actionLabel={processed.length ? 'Clear search' : undefined} onAction={processed.length ? () => setQuery('') : undefined} /></div>}</div>;
};

export default RecyclerHistoryPage;
