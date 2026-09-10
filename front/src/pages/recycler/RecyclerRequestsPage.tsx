import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { DigitalLot } from '../../types';
import RecyclerLotCard from './RecyclerLotCard';

const RecyclerRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { lots, updateLotStatus } = usePlatform();
  const [rejecting, setRejecting] = useState<DigitalLot | null>(null);
  const [reason, setReason] = useState('');
  const requests = lots.filter((lot) => lot.status === 'sent_to_recycler' && (lot.recyclerId === user?.id || lot.recyclerName === user?.name || !lot.recyclerId));

  const accept = (lot: DigitalLot) => {
    try { updateLotStatus(lot.id, 'accepted', { recyclerId: user?.id, recyclerName: user?.name }); showToast(`${lot.lotName} accepted into the facility pipeline.`, 'success'); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Could not accept this lot.', 'error'); }
  };
  const reject = () => {
    if (!rejecting) return;
    if (reason.trim().length < 8) return showToast('Give the collector a clear reason (at least 8 characters).', 'error');
    try { updateLotStatus(rejecting.id, 'rejected', { recyclerId: user?.id, recyclerName: user?.name, rejectionReason: reason.trim() }); showToast('Lot declined with feedback for the collector.', 'info'); setRejecting(null); setReason(''); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Could not decline this lot.', 'error'); }
  };

  return <div className="max-container py-7 md:py-9 flex flex-col gap-7"><PageHeader eyebrow="Incoming material" title="Lot requests" description="Review the manifest and handling notes before committing facility capacity." />{requests.length ? <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{requests.map((lot) => <RecyclerLotCard key={lot.id} lot={lot} actions={<div className="flex gap-2"><Button variant="danger" size="sm" leftIcon={<XCircle size={15} />} onClick={() => setRejecting(lot)}>Decline</Button><Button size="sm" leftIcon={<CheckCircle2 size={15} />} onClick={() => accept(lot)}>Accept lot</Button></div>} />)}</div> : <div className="card"><EmptyState icon={ClipboardList} title="No requests waiting" description="You have reviewed every incoming digital lot." /></div>}<Modal isOpen={Boolean(rejecting)} onClose={() => { setRejecting(null); setReason(''); }} title="Decline digital lot" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" onClick={reject}>Send feedback</Button></div>}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Explain what the collector needs to correct before resubmitting <strong style={{ color: 'var(--text-primary)' }}>{rejecting?.lotName}</strong>.</p><label htmlFor="rejection-reason" className="block text-sm font-medium mt-4">Reason</label><textarea id="rejection-reason" rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full border rounded-xl px-3 py-2.5 mt-1.5 resize-none outline-none focus:ring-2 focus:ring-red-100" style={{ borderColor: 'var(--border)' }} placeholder="Example: Battery terminals must be isolated before transport." /></Modal></div>;
};

export default RecyclerRequestsPage;
