import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Factory, MapPin, Package, Recycle, Scale, ShieldCheck, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import TraceabilityTimeline from '../../components/TraceabilityTimeline';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { LotStatus, WasteCategory } from '../../types';
import { buildLotTrace, categoryLabels, formatCurrency, formatDateTime } from './recyclerUtils';

type Confirmation = 'receive' | 'process' | null;

const RecyclerLotDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { getLot, updateLotStatus } = usePlatform();
  const lot = getLot(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const materialSummary = useMemo(() => {
    const values = new Map<WasteCategory, { quantity: number; weight: number }>();
    lot?.items.forEach((item) => { const current = values.get(item.category) ?? { quantity: 0, weight: 0 }; values.set(item.category, { quantity: current.quantity + item.quantity, weight: current.weight + item.weightKg }); });
    return [...values.entries()];
  }, [lot]);

  if (!lot) return <div className="max-container py-10"><EmptyState title="Lot not found" description="This digital lot is unavailable or was reset." actionLabel="Back to lots" onAction={() => navigate('/recycler/lots')} /></div>;

  const changeStatus = (status: LotStatus, rejectionReason?: string) => {
    try {
      updateLotStatus(lot.id, status, { recyclerId: user?.id, recyclerName: user?.name, rejectionReason });
      const message: Partial<Record<LotStatus, string>> = { accepted: 'Lot accepted into the facility workflow.', rejected: 'Feedback sent to the collector.', received: 'Physical receipt confirmed.', processed: 'Processing completed and traceability closed.' };
      showToast(message[status] ?? 'Lot updated.', status === 'rejected' ? 'info' : 'success');
      setRejectOpen(false); setReason(''); setConfirmation(null);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Could not update this lot.', 'error'); }
  };

  const submitRejection = () => {
    if (reason.trim().length < 8) return showToast('Give the collector a clear reason (at least 8 characters).', 'error');
    changeStatus('rejected', reason.trim());
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader backTo="/recycler/lots" eyebrow="Facility lot" title={lot.lotName} description={`${lot.id} · Updated ${formatDateTime(lot.updatedAt)}`} actions={<StatusBadge status={lot.status} />} />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4"><Package size={18} style={{ color: 'var(--primary)' }} /><p className="text-2xl font-bold mt-3">{lot.totalQuantity}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Units declared</p></div>
        <div className="card p-4"><Scale size={18} style={{ color: 'var(--primary)' }} /><p className="text-2xl font-bold mt-3">{lot.totalWeightKg} <span className="text-sm font-normal">kg</span></p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Declared weight</p></div>
        <div className="card p-4"><Recycle size={18} style={{ color: 'var(--primary)' }} /><p className="text-xl font-bold mt-3">{materialSummary.length}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Material categories</p></div>
        <div className="card p-4"><Factory size={18} style={{ color: 'var(--primary)' }} /><p className="text-xl font-bold mt-3">{formatCurrency(lot.estimatedValue)}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Estimated material value</p></div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_370px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <section className="card overflow-hidden"><div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}><h2 className="font-semibold">Digital manifest</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Verify these records against the physical shipment.</p></div><div className="divide-y" style={{ borderColor: 'var(--border)' }}>{lot.items.map((item) => <div key={item.id} className="p-4 flex items-center gap-3"><span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Package size={19} /></span><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{item.itemName}</p><p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{categoryLabels[item.category]} · {item.condition.replaceAll('_', ' ')}</p></div><div className="text-right"><p className="text-sm font-semibold">{item.quantity} × · {item.weightKg} kg</p><p className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>{formatCurrency(item.estimatedValue)}</p></div></div>)}</div></section>
          <section className="card p-5"><h2 className="font-semibold">Material summary</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">{materialSummary.map(([category, summary]) => <div key={category} className="rounded-xl p-3 flex justify-between gap-3" style={{ backgroundColor: 'var(--background)' }}><span className="text-sm">{categoryLabels[category]}</span><span className="text-sm font-semibold">{summary.quantity} · {summary.weight.toFixed(1)} kg</span></div>)}</div></section>
          <section className="card p-5 grid sm:grid-cols-2 gap-5"><div><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin size={14} /> Collector storage</p><p className="text-sm font-medium mt-1">{lot.storageLocation || 'Not recorded'}</p></div><div><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={14} /> Handling notes</p><p className="text-sm font-medium mt-1">{lot.notes || 'No special instructions'}</p></div></section>
          {lot.rejectionReason && <section className="rounded-xl border p-4 flex gap-3" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}><AlertTriangle size={19} style={{ color: 'var(--danger)' }} /><div><p className="text-sm font-semibold">Decline reason</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{lot.rejectionReason}</p></div></section>}
        </div>
        <aside className="card p-5 xl:sticky xl:top-6"><h2 className="font-semibold">Chain of custody</h2><TraceabilityTimeline events={buildLotTrace(lot)} className="mt-5" />
          {lot.status === 'sent_to_recycler' && <div className="grid grid-cols-2 gap-2 mt-5"><Button variant="danger" leftIcon={<XCircle size={16} />} onClick={() => setRejectOpen(true)}>Decline</Button><Button leftIcon={<CheckCircle2 size={16} />} onClick={() => changeStatus('accepted')}>Accept</Button></div>}
          {lot.status === 'accepted' && <Button fullWidth className="mt-5" leftIcon={<Factory size={16} />} onClick={() => setConfirmation('receive')}>Confirm physical receipt</Button>}
          {lot.status === 'received' && <Button fullWidth className="mt-5" leftIcon={<Recycle size={16} />} onClick={() => setConfirmation('process')}>Mark processing complete</Button>}
          {lot.status === 'processed' && <div className="rounded-xl p-3 text-xs text-center mt-5" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><CheckCircle2 size={18} className="mx-auto mb-1" />Closed-loop record complete</div>}
        </aside>
      </div>

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title="Decline digital lot" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant="danger" onClick={submitRejection}>Send feedback</Button></div>}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Give the collector enough detail to correct and resubmit the lot.</p><textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full border rounded-xl px-3 py-2.5 mt-4 resize-none outline-none focus:ring-2 focus:ring-red-100" style={{ borderColor: 'var(--border)' }} aria-label="Reason for declining" placeholder="Describe the manifest, packing, or category issue" /></Modal>
      <Modal isOpen={Boolean(confirmation)} onClose={() => setConfirmation(null)} title={confirmation === 'receive' ? 'Confirm physical receipt' : 'Complete processing'} size="sm" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmation(null)}>Cancel</Button><Button onClick={() => changeStatus(confirmation === 'receive' ? 'received' : 'processed')}>Confirm</Button></div>}><p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{confirmation === 'receive' ? 'Confirm only after the shipment has arrived and the declared material is present.' : 'This closes the traceability record and records the collector payout. Confirm only after responsible processing is complete.'}</p></Modal>
    </div>
  );
};

export default RecyclerLotDetailPage;
