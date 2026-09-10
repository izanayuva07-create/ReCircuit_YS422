import React, { useMemo, useState } from 'react';
import { Check, Layers3, Package, Weight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { categoryLabels, formatCurrency } from '../../utils/format';

const CreateLotPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { inventory, createLot } = usePlatform();
  const navigate = useNavigate();
  const available = inventory.filter((item) => (!user?.id || item.collectorId === user.id) && !item.lotId);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ lotName: '', storageLocation: user?.location ?? '', notes: '' });

  const chosen = useMemo(() => available.filter((item) => selected.includes(item.id)), [available, selected]);
  const totals = chosen.reduce((summary, item) => ({ quantity: summary.quantity + item.quantity, weight: summary.weight + item.weightKg, value: summary.value + item.estimatedValue }), { quantity: 0, weight: 0, value: 0 });

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.lotName.trim().length < 3) return showToast('Give the lot a descriptive name.', 'error');
    if (selected.length === 0) return showToast('Select at least one inventory item.', 'error');
    try {
      const lot = createLot({ lotName: form.lotName, itemIds: selected, storageLocation: form.storageLocation, notes: form.notes });
      showToast('Digital lot created.', 'success');
      navigate(`/collector/lots/${lot.id}`, { replace: true });
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : 'Could not create this lot.', 'error');
    }
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader backTo="/collector/lots" eyebrow="New digital lot" title="Bundle inventory" description="Choose sorted items that will travel together to the same recycler." />
      {available.length === 0 ? (
        <div className="card"><EmptyState icon={Package} title="No inventory is available" description="All items are already assigned to lots. Add a collected item before creating another lot." actionLabel="Add inventory" onAction={() => navigate('/collector/scan')} /></div>
      ) : (
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Select items</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{selected.length} of {available.length} records selected</p></div><button type="button" className="text-xs font-semibold" style={{ color: 'var(--primary)' }} onClick={() => setSelected(selected.length === available.length ? [] : available.map((item) => item.id))}>{selected.length === available.length ? 'Clear all' : 'Select all'}</button></div>
            <div className="flex flex-col gap-3 mt-5">
              {available.map((item) => {
                const active = selected.includes(item.id);
                return (
                  <button type="button" key={item.id} onClick={() => toggle(item.id)} className="rounded-xl border p-4 text-left flex items-center gap-3 transition-colors" style={{ borderColor: active ? 'var(--primary)' : 'var(--border)', backgroundColor: active ? 'var(--primary-subtle)' : 'var(--surface)' }}>
                    <span className="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0" style={{ borderColor: active ? 'var(--primary)' : 'var(--border)', backgroundColor: active ? 'var(--primary)' : '#fff', color: '#fff' }}>{active && <Check size={14} />}</span>
                    <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{item.itemName}</span><span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{categoryLabels[item.category]} · {item.quantity} items</span></span>
                    <span className="text-right"><span className="block text-sm font-semibold">{item.weightKg} kg</span><span className="block text-xs mt-0.5" style={{ color: 'var(--primary)' }}>{formatCurrency(item.estimatedValue)}</span></span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="card p-5 lg:sticky lg:top-6">
            <h2 className="font-semibold flex items-center gap-2"><Layers3 size={18} style={{ color: 'var(--primary)' }} /> Lot details</h2>
            <div className="flex flex-col gap-4 mt-5">
              <Input label="Lot name" value={form.lotName} onChange={(event) => setForm((current) => ({ ...current, lotName: event.target.value }))} placeholder="Example: September devices A" />
              <Input label="Storage location" value={form.storageLocation} onChange={(event) => setForm((current) => ({ ...current, storageLocation: event.target.value }))} placeholder="Rack, godown, or facility" />
              <div><label htmlFor="lot-notes" className="text-sm font-medium">Handling notes</label><textarea id="lot-notes" rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="w-full border rounded-lg px-3 py-2.5 mt-1.5 resize-none outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} placeholder="Sorting or safety details" /></div>
            </div>
            <div className="rounded-xl p-4 mt-5 grid grid-cols-3 gap-2" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              <div><Package size={15} style={{ color: 'var(--primary)' }} /><p className="text-lg font-bold mt-1">{totals.quantity}</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Items</p></div>
              <div><Weight size={15} style={{ color: 'var(--primary)' }} /><p className="text-lg font-bold mt-1">{totals.weight.toFixed(1)}</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>kg</p></div>
              <div><Layers3 size={15} style={{ color: 'var(--primary)' }} /><p className="text-sm font-bold mt-2 truncate">{formatCurrency(totals.value)}</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Value</p></div>
            </div>
            <Button type="submit" fullWidth className="mt-5" disabled={selected.length === 0}>Create digital lot</Button>
          </aside>
        </form>
      )}
    </div>
  );
};

export default CreateLotPage;
