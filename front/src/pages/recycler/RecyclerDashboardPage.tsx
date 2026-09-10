import React from 'react';
import { ArrowRight, ClipboardCheck, Factory, History, Recycle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MapView from '../../components/MapView';
import AwarenessCard from '../../components/AwarenessCard';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import RecyclerLotCard from './RecyclerLotCard';
import { categoryLabels } from './recyclerUtils';
import { recyclerDemoRoute, recyclerMapLocations } from '../../data/locations';
import { awarenessCards } from '../../data/awareness';

const RecyclerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { lots } = usePlatform();
  const relevant = lots.filter((lot) => lot.recyclerId === user?.id || lot.recyclerName === user?.name || (lot.status === 'sent_to_recycler' && !lot.recyclerId));
  const requests = relevant.filter((lot) => lot.status === 'sent_to_recycler');
  const active = relevant.filter((lot) => ['accepted', 'received'].includes(lot.status));
  const processed = relevant.filter((lot) => lot.status === 'processed');
  const processedWeight = processed.reduce((sum, lot) => sum + lot.totalWeightKg, 0);
  const pendingVerification = relevant.filter((lot) => lot.status === 'accepted');
  const receivedWeight = relevant.filter((lot) => lot.status === 'received').reduce((sum, lot) => sum + lot.totalWeightKg, 0);
  const collectorNetwork = new Set(relevant.map((lot) => lot.collectorId)).size;
  const materialWeights = new Map<string, number>();
  processed.flatMap((lot) => lot.items).forEach((item) => materialWeights.set(item.category, (materialWeights.get(item.category) ?? 0) + item.weightKg));
  const topMaterials = [...materialWeights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-8">
      <PageHeader eyebrow="Recycler workspace" title={`Welcome, ${user?.name ?? 'Recycler'}`} description="Review incoming digital lots, confirm receipt, and close the recycling traceability loop." actions={<Link to="/recycler/requests" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}><ClipboardCheck size={17} /> Review requests</Link>} />
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4"><StatCard label="Incoming lots" value={requests.length} icon="ClipboardList" color="#9333ea" /><StatCard label="Pending verification" value={pendingVerification.length} icon="BadgeCheck" color="#2563eb" /><StatCard label="Received material" value={receivedWeight.toFixed(1)} unit="kg" icon="PackageCheck" color="#0f766e" /><StatCard label="Processed waste" value={processedWeight.toFixed(1)} unit="kg" icon="Scale" /><StatCard label="Collector network" value={collectorNetwork} icon="Users" color="#b56d11" /></section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[{ to: '/recycler/requests', icon: ClipboardCheck, title: 'Incoming requests', text: `${requests.length} lot${requests.length === 1 ? '' : 's'} need a decision` }, { to: '/recycler/lots', icon: Factory, title: 'Facility workflow', text: `${active.length} accepted lot${active.length === 1 ? '' : 's'} in progress` }, { to: '/recycler/history', icon: History, title: 'Processing history', text: `${processed.length} traceability record${processed.length === 1 ? '' : 's'} closed` }].map(({ to, icon: Icon, title, text }) => <Link key={to} to={to} className="card p-4 flex items-center gap-3"><span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Icon size={20} /></span><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{text}</span></span><ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} /></Link>)}
      </section>

      <MapView
        locations={recyclerMapLocations}
        route={recyclerDemoRoute}
        title="Incoming collectors & lots"
        description="Preview collector arrival context and the facility destination without blocking the lot workflow."
        compact
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        <section><div className="flex items-end justify-between gap-3 mb-4"><div><h2 className="text-lg font-bold">Lots needing attention</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>New requests and accepted material ready for the next step.</p></div><Link to="/recycler/lots" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>View all →</Link></div><div className="grid grid-cols-1 gap-4">{[...requests, ...active].slice(0, 3).map((lot) => <RecyclerLotCard key={lot.id} lot={lot} compact />)}{requests.length + active.length === 0 && <div className="card p-8 text-center"><Recycle size={30} className="mx-auto" style={{ color: 'var(--primary)' }} /><p className="text-sm font-semibold mt-3">No lots need attention</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>New collector requests will appear here.</p></div>}</div></section>
        <aside className="flex flex-col gap-5">
          <section className="card p-5"><h2 className="font-semibold flex items-center gap-2"><Recycle size={18} style={{ color: 'var(--primary)' }} /> Material processed</h2>{topMaterials.length ? <div className="mt-5 flex flex-col gap-4">{topMaterials.map(([category, weight]) => <div key={category}><div className="flex justify-between text-xs"><span>{categoryLabels[category as keyof typeof categoryLabels]}</span><strong>{weight.toFixed(1)} kg</strong></div><div className="h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--border)' }}><div className="h-full rounded-full" style={{ width: `${Math.max(8, (weight / processedWeight) * 100)}%`, backgroundColor: 'var(--primary)' }} /></div></div>)}</div> : <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>Material categories appear after the first lot is processed.</p>}</section>
          <section className="card p-5 flex gap-3"><ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--primary)' }} /><div><h2 className="text-sm font-semibold">Verified facility</h2><p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Your acceptance and processing confirmations form the final audited stages of each item’s journey.</p></div></section>
          <AwarenessCard card={awarenessCards[5]} compact />
        </aside>
      </div>
    </div>
  );
};

export default RecyclerDashboardPage;
