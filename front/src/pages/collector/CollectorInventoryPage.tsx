import React, { useMemo, useState } from 'react';
import { Archive, Edit3, Layers3, Package, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { InventoryItem } from '../../types';
import { categoryLabels, conditionLabels, formatCurrency, formatDate } from '../../utils/format';

const inventoryFilters = [
  { label: 'All items', value: 'all' },
  { label: 'Available for lot', value: 'available' },
  { label: 'Assigned to lot', value: 'assigned' },
];

const CollectorInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { inventory, lots, updateInventoryItem, removeInventoryItem } = usePlatform();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ quantity: '', weightKg: '', estimatedValue: '', collectedFrom: '' });
  const [deleting, setDeleting] = useState<InventoryItem | null>(null);

  const myInventory = inventory.filter((item) => !user?.id || item.collectorId === user.id);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return myInventory.filter((item) => {
      if (filter === 'available' && item.lotId) return false;
      if (filter === 'assigned' && !item.lotId) return false;
      return !normalized || `${item.itemName} ${item.collectedFrom ?? ''} ${categoryLabels[item.category]}`.toLowerCase().includes(normalized);
    });
  }, [filter, myInventory, query]);
  const available = myInventory.filter((item) => !item.lotId);
  const totalWeight = myInventory.reduce((sum, item) => sum + item.weightKg, 0);
  const totalValue = myInventory.reduce((sum, item) => sum + item.estimatedValue, 0);

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setEditForm({ quantity: String(item.quantity), weightKg: String(item.weightKg), estimatedValue: String(item.estimatedValue), collectedFrom: item.collectedFrom ?? '' });
  };

  const saveEdit = () => {
    if (!editing) return;
    const quantity = Number(editForm.quantity);
    const weightKg = Number(editForm.weightKg);
    const estimatedValue = Number(editForm.estimatedValue);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(estimatedValue) || estimatedValue < 0) {
      showToast('Enter valid quantity, weight, and value.', 'error');
      return;
    }
    updateInventoryItem(editing.id, { quantity, weightKg, estimatedValue, collectedFrom: editForm.collectedFrom.trim() || undefined });
    showToast('Inventory item updated.', 'success');
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    try {
      removeInventoryItem(deleting.id);
      showToast('Inventory item removed.', 'success');
      setDeleting(null);
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : 'Could not remove the item.', 'error');
    }
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader
        eyebrow="Material records"
        title="Inventory"
        description="Every collected item stays traceable from hand-off through its digital lot."
        actions={<div className="flex gap-2"><Link to="/collector/lots" className="hidden sm:inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}><Layers3 size={17} /> Lots</Link><Link to="/collector/scan" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}><Plus size={17} /> Add item</Link></div>}
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Inventory items" value={myInventory.reduce((sum, item) => sum + item.quantity, 0)} icon="Package" />
        <StatCard label="Total weight" value={totalWeight.toFixed(1)} unit="kg" icon="Weight" color="#0f766e" />
        <StatCard label="Estimated value" value={formatCurrency(totalValue)} icon="IndianRupee" color="#ca8a04" />
        <StatCard label="Ready for a lot" value={available.length} icon="Layers3" color="#2563eb" />
      </section>

      {available.length > 0 && (
        <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: 'var(--primary-subtle)' }}>
          <div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{available.length} item record{available.length === 1 ? '' : 's'} ready to bundle</p><p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Create a digital lot when the batch is ready for a certified recycler.</p></div>
          <Link to="/collector/lots/new" className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>Create lot <Layers3 size={16} /></Link>
        </div>
      )}

      <section className="card p-4 flex flex-col gap-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search inventory" />
        <FilterBar filters={inventoryFilters} active={filter} onChange={setFilter} />
      </section>

      {visible.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((item) => {
            const lot = item.lotId ? lots.find((candidate) => candidate.id === item.lotId) : undefined;
            return (
              <article key={item.id} className="card overflow-hidden flex flex-col">
                <div className="h-36 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)' }}>
                  {item.images[0] ? <img src={item.images[0]} alt={item.itemName} className="w-full h-full object-cover" /> : <Package size={40} style={{ color: 'var(--primary)' }} />}
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.itemName}</h2><p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{categoryLabels[item.category]} · {conditionLabels[item.condition]}</p></div>{lot ? <StatusBadge status={lot.status} /> : <span className="text-xs rounded-full px-2 py-1" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>Available</span>}</div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
                    <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Quantity</p><p className="text-sm font-semibold mt-0.5">{item.quantity}</p></div>
                    <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Weight</p><p className="text-sm font-semibold mt-0.5">{item.weightKg} kg</p></div>
                    <div><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Value</p><p className="text-sm font-semibold mt-0.5">{formatCurrency(item.estimatedValue)}</p></div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collected {formatDate(item.collectedAt)}{item.collectedFrom ? ` · ${item.collectedFrom}` : ''}</p>
                  {lot && <Link to={`/collector/lots/${lot.id}`} className="text-xs font-semibold truncate" style={{ color: 'var(--primary)' }}>Lot: {lot.lotName} →</Link>}
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button variant="outline" size="sm" className="flex-1" leftIcon={<Edit3 size={14} />} onClick={() => openEdit(item)} disabled={Boolean(lot && lot.status !== 'draft' && lot.status !== 'ready')}>Edit</Button>
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeleting(item)} disabled={Boolean(item.lotId)} aria-label={`Remove ${item.itemName}`} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : <EmptyState icon={Archive} title="No inventory matches" description={myInventory.length ? 'Try clearing your search or filters.' : 'Scan or add a collected item to begin building inventory.'} actionLabel={myInventory.length ? 'Clear filters' : 'Add item'} onAction={() => myInventory.length ? (setQuery(''), setFilter('all')) : navigate('/collector/scan')} />}

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${editing?.itemName ?? 'item'}`} footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit}>Save changes</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Quantity" type="number" min="1" value={editForm.quantity} onChange={(event) => setEditForm((current) => ({ ...current, quantity: event.target.value }))} />
          <Input label="Weight (kg)" type="number" min="0.01" step="0.01" value={editForm.weightKg} onChange={(event) => setEditForm((current) => ({ ...current, weightKg: event.target.value }))} />
          <div className="col-span-2"><Input label="Estimated value (₹)" type="number" min="0" value={editForm.estimatedValue} onChange={(event) => setEditForm((current) => ({ ...current, estimatedValue: event.target.value }))} /></div>
          <div className="col-span-2"><Input label="Collected from" value={editForm.collectedFrom} onChange={(event) => setEditForm((current) => ({ ...current, collectedFrom: event.target.value }))} /></div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Remove inventory item" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>Keep item</Button><Button variant="danger" onClick={confirmDelete}>Remove</Button></div>}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Remove <strong style={{ color: 'var(--text-primary)' }}>{deleting?.itemName}</strong>? This only affects the local inventory record.</p>
      </Modal>
    </div>
  );
};

export default CollectorInventoryPage;
