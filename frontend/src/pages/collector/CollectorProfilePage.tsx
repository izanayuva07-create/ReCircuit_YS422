import React, { useState } from 'react';
import { BadgeCheck, CalendarDays, History, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate } from '../../utils/format';

const CollectorProfilePage: React.FC = () => {
  const { user, updateProfile, authMode } = useAuth();
  const { showToast } = useAppContext();
  const { bookings, inventory, lots, resetDemoData } = usePlatform();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '' });
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const myPickups = bookings.filter((booking) => booking.collectorId === user?.id && booking.status === 'completed');
  const myInventory = inventory.filter((item) => item.collectorId === user?.id);
  const myLots = lots.filter((lot) => lot.collectorId === user?.id);
  const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.phone.replace(/\D/g, '').length < 10 || form.location.trim().length < 3) return showToast('Complete all profile fields with valid details.', 'error');
    setSaving(true);
    try { await updateProfile({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), location: form.location.trim() }); showToast('Collector profile updated.', 'success'); }
    catch (reason) { showToast(reason instanceof Error ? reason.message : 'Could not update the profile.', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader eyebrow="Account" title="Collector profile" description="Keep your service details current so sources can coordinate safe pickups." actions={<Link to="/collector/history" className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}><History size={17} /> History</Link>} />
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard label="Completed pickups" value={myPickups.length} icon="Truck" /><StatCard label="Inventory weight" value={myInventory.reduce((sum, item) => sum + item.weightKg, 0).toFixed(1)} unit="kg" icon="Weight" /><StatCard label="Digital lots" value={myLots.length} icon="Layers3" /><StatCard label="Collector rating" value="4.7" unit="/ 5" icon="Star" color="#ca8a04" /></section>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
        <aside className="flex flex-col gap-5">
          <section className="card p-5 text-center"><div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>{user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-3xl object-cover" /> : initials}</div><h2 className="font-bold mt-4">{user?.name ?? 'Collector'}</h2><span className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><BadgeCheck size={13} /> Verified collector</span><div className="mt-5 pt-4 border-t text-left flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><Mail size={14} /> {user?.email}</p><p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><CalendarDays size={14} /> Joined {user?.createdAt ? formatDate(user.createdAt) : 'recently'}</p></div></section>
          <section className="card p-5"><h2 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck size={17} style={{ color: 'var(--primary)' }} /> Service verification</h2><div className="mt-4 flex flex-col gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}><p className="flex justify-between"><span>Identity</span><strong style={{ color: 'var(--primary)' }}>Verified</strong></p><p className="flex justify-between"><span>Pickup safety</span><strong style={{ color: 'var(--primary)' }}>Completed</strong></p><p className="flex justify-between"><span>Vehicle profile</span><strong>Light commercial</strong></p></div></section>
        </aside>
        <section className="card p-5 md:p-6"><h2 className="font-semibold">Contact & service area</h2><form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><Input label="Full name / business" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} leftIcon={<Truck size={16} />} /><Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} leftIcon={<Mail size={16} />} /><Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} leftIcon={<Phone size={16} />} /><Input label="Primary service area" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} leftIcon={<MapPin size={16} />} /><div className="sm:col-span-2 flex justify-end pt-2"><Button type="submit" isLoading={saving}>Save profile</Button></div></form><div className="mt-7 pt-5 border-t" style={{ borderColor: 'var(--border)' }}><p className="text-sm font-semibold">Demo data</p><p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-secondary)' }}>{authMode === 'demo' ? 'Restore the shared marketplace to its original sample state.' : 'The connected API controls operational data.'}</p><Button variant="outline" leftIcon={<RotateCcw size={15} />} onClick={() => setResetOpen(true)} disabled={authMode !== 'demo'}>Reset demo marketplace</Button></div></section>
      </div>
      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset shared demo data" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetDemoData(); setResetOpen(false); showToast('Demo marketplace restored.', 'success'); }}>Reset data</Button></div>}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This restores listings, bids, pickups, inventory, lots, and notifications for every demo role.</p></Modal>
    </div>
  );
};

export default CollectorProfilePage;
