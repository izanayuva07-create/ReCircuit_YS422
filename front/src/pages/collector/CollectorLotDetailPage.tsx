import React, { useMemo, useState } from 'react';
import { AlertCircle, Factory, Layers3, MapPin, Package, Send, ShieldCheck, Weight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import StatusBadge from '../../components/StatusBadge';
import TraceabilityTimeline from '../../components/TraceabilityTimeline';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import type { TraceEvent } from '../../types';
import { categoryLabels, formatCurrency, formatDate } from '../../utils/format';

const recyclerOptions = [
  { label: 'GreenLoop Recycling · Sriperumbudur', value: 'GreenLoop Recycling' },
  { label: 'Chennai EcoMetals · Manali', value: 'Chennai EcoMetals' },
  { label: 'Circular Tech Recovery · Oragadam', value: 'Circular Tech Recovery' },
];

const CollectorLotDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { getLot, sendLotToRecycler, updateLotStatus } = usePlatform();
  const lot = getLot(id);
  const [sendOpen, setSendOpen] = useState(false);
  const [recycler, setRecycler] = useState(recyclerOptions[0].value);

  const trace = useMemo<TraceEvent[]>(() => {
    if (!lot) return [];
    const decisionDone = ['accepted', 'rejected', 'received', 'processed'].includes(lot.status);
    const received = ['received', 'processed'].includes(lot.status);
    const processed = lot.status === 'processed';
    return [
      { stage: 'lot_created', label: 'Digital lot created', description: `${lot.items.length} inventory records were grouped.`, timestamp: lot.createdAt, status: 'completed' },
      { stage: 'recycler_accepted', label: lot.status === 'rejected' ? 'Recycler declined' : 'Recycler decision', description: lot.status === 'rejected' ? lot.rejectionReason || 'Review and resubmit the lot.' : lot.recyclerName ? `Sent to ${lot.recyclerName}.` : 'Choose a verified facility.', timestamp: decisionDone ? lot.acceptedAt || lot.updatedAt : undefined, status: decisionDone ? 'completed' : lot.status === 'sent_to_recycler' ? 'current' : 'upcoming' },
      { stage: 'recycler_received', label: 'Received at facility', description: 'The recycler verifies the physical shipment.', timestamp: received ? lot.receivedAt || lot.updatedAt : undefined, status: received ? 'completed' : lot.status === 'accepted' ? 'current' : 'upcoming' },
      { stage: 'recycling_completed', label: 'Processing completed', description: 'Recoverable materials enter responsible recycling streams.', timestamp: processed ? lot.processedAt || lot.updatedAt : undefined, status: processed ? 'completed' : received ? 'current' : 'upcoming' },
    ];
  }, [lot]);

  if (!lot) return <div className="max-container py-10"><EmptyState title="Digital lot not found" description="It may have been removed or reset." actionLabel="Back to lots" onAction={() => navigate('/collector/lots')} /></div>;

  const send = () => {
    try {
      sendLotToRecycler(lot.id, recycler);
      showToast(`Lot sent to ${recycler}.`, 'success');
      setSendOpen(false);
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : 'Could not send this lot.', 'error');
    }
  };

  const prepareAgain = () => {
    try {
      updateLotStatus(lot.id, 'ready');
      showToast('Lot returned to ready status. Update it and submit again.', 'success');
    } catch (reason) { showToast(reason instanceof Error ? reason.message : 'Could not update the lot.', 'error'); }
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader backTo="/collector/lots" eyebrow="Digital lot" title={lot.lotName} description={`${lot.id} · Created ${formatDate(lot.createdAt)}`} actions={<StatusBadge status={lot.status} />} />

      {lot.status === 'rejected' && (
        <div className="rounded-xl border p-4 flex items-start gap-3" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          <AlertCircle size={20} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#991b1b' }}>Recycler requested changes</p><p className="text-xs mt-1" style={{ color: '#b91c1c' }}>{lot.rejectionReason || 'Review the material details before resubmitting.'}</p></div>
          <Button size="sm" variant="outline" onClick={prepareAgain}>Prepare again</Button>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-4"><Package size={18} style={{ color: 'var(--primary)' }} /><p className="text-2xl font-bold mt-3">{lot.totalQuantity}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Total units</p></div>
        <div className="card p-4"><Weight size={18} style={{ color: 'var(--primary)' }} /><p className="text-2xl font-bold mt-3">{lot.totalWeightKg.toFixed(1)} <span className="text-sm font-normal">kg</span></p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Verified weight</p></div>
        <div className="card p-4"><Layers3 size={18} style={{ color: 'var(--primary)' }} /><p className="text-xl font-bold mt-3">{formatCurrency(lot.estimatedValue)}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Estimated value</p></div>
        <div className="card p-4"><Factory size={18} style={{ color: 'var(--primary)' }} /><p className="text-sm font-bold mt-3 truncate">{lot.recyclerName ?? 'Not selected'}</p><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Recycler</p></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <section className="card overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}><h2 className="font-semibold">Inventory manifest</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{lot.items.length} traceable item records</p></div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {lot.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Package size={19} /></span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{item.itemName}</p><p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{categoryLabels[item.category]} · {item.quantity} unit{item.quantity === 1 ? '' : 's'}</p></div>
                  <div className="text-right"><p className="text-sm font-semibold">{item.weightKg} kg</p><p className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>{formatCurrency(item.estimatedValue)}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5 grid sm:grid-cols-2 gap-5">
            <div><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin size={14} /> Storage location</p><p className="text-sm font-medium mt-1">{lot.storageLocation || 'Not recorded'}</p></div>
            <div><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={14} /> Handling note</p><p className="text-sm font-medium mt-1">{lot.notes || 'No special handling note'}</p></div>
          </section>
        </div>

        <aside className="card p-5">
          <h2 className="font-semibold">Traceability</h2>
          <TraceabilityTimeline events={trace} className="mt-5" />
          {lot.status === 'ready' && <Button fullWidth leftIcon={<Send size={17} />} onClick={() => setSendOpen(true)}>Send to recycler</Button>}
          {lot.status === 'sent_to_recycler' && <p className="rounded-xl p-3 text-xs text-center" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>Waiting for {lot.recyclerName ?? 'the recycler'} to review this lot.</p>}
          {lot.status === 'processed' && <p className="rounded-xl p-3 text-xs text-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>Traceability complete. This material was processed responsibly.</p>}
        </aside>
      </div>

      <Modal isOpen={sendOpen} onClose={() => setSendOpen(false)} title="Choose a certified recycler" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button><Button leftIcon={<Send size={16} />} onClick={send}>Send lot</Button></div>}>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>The selected facility will receive the complete digital manifest and can accept or decline it.</p>
        <Select label="Recycler" options={recyclerOptions} value={recycler} onChange={(event) => setRecycler(event.target.value)} />
      </Modal>
    </div>
  );
};

export default CollectorLotDetailPage;
