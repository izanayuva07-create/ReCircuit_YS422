import React, { useState } from 'react';
import { Award, BadgeCheck, Factory, Mail, MapPin, Phone, Plus, RotateCcw, ShieldCheck, X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { usePlatform } from '../../context/PlatformContext';
import type { WasteCategory } from '../../types';
import { categoryLabels } from './recyclerUtils';

interface FacilitySettings { certifications: string[]; acceptedCategories: WasteCategory[] }
const defaultSettings: FacilitySettings = { certifications: ['CPCB Authorized Recycler', 'ISO 14001 Environmental Management'], acceptedCategories: ['mobile', 'laptop', 'desktop', 'tablet', 'battery', 'pcb', 'cable', 'tv_monitor', 'printer'] };

const RecyclerProfilePage: React.FC = () => {
  const { user, updateProfile, authMode } = useAuth();
  const { showToast } = useAppContext();
  const { lots, resetDemoData } = usePlatform();
  const [settings, setSettings] = useLocalStorage<FacilitySettings>('rc_recycler_facility', defaultSettings);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', location: user?.location ?? '' });
  const [certificate, setCertificate] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const relevant = lots.filter((lot) => lot.recyclerId === user?.id || lot.recyclerName === user?.name);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.email) || form.phone.replace(/\D/g, '').length < 10 || form.location.trim().length < 3) return showToast('Complete all facility contact fields.', 'error');
    if (!settings.certifications.length || !settings.acceptedCategories.length) return showToast('Keep at least one certification and accepted category.', 'error');
    setSaving(true);
    try { await updateProfile({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), location: form.location.trim() }); showToast('Facility profile updated.', 'success'); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Could not update the facility.', 'error'); }
    finally { setSaving(false); }
  };
  const addCertificate = () => { const value = certificate.trim(); if (!value || settings.certifications.includes(value)) return; setSettings({ ...settings, certifications: [...settings.certifications, value] }); setCertificate(''); };
  const toggleCategory = (category: WasteCategory) => setSettings({ ...settings, acceptedCategories: settings.acceptedCategories.includes(category) ? settings.acceptedCategories.filter((item) => item !== category) : [...settings.acceptedCategories, category] });

  return <div className="max-container py-7 md:py-9 flex flex-col gap-7"><PageHeader eyebrow="Facility account" title="Recycler profile" description="Maintain facility details, certifications, and the material categories you can responsibly process." /><section className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard label="Lots received" value={relevant.filter((lot) => ['received', 'processed'].includes(lot.status)).length} icon="Factory" /><StatCard label="Processed weight" value={relevant.filter((lot) => lot.status === 'processed').reduce((sum, lot) => sum + lot.totalWeightKg, 0).toFixed(1)} unit="kg" icon="Recycle" /><StatCard label="Certifications" value={settings.certifications.length} icon="Award" color="#9333ea" /><StatCard label="Accepted categories" value={settings.acceptedCategories.length} icon="Tags" color="#2563eb" /></section><form onSubmit={save} className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start"><div className="flex flex-col gap-5"><section className="card p-5 md:p-6"><h2 className="font-semibold flex items-center gap-2"><Factory size={18} style={{ color: 'var(--primary)' }} /> Facility details</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><Input label="Facility name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} leftIcon={<Factory size={16} />} /><Input label="Official email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} leftIcon={<Mail size={16} />} /><Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} leftIcon={<Phone size={16} />} /><Input label="Facility location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} leftIcon={<MapPin size={16} />} /></div></section><section className="card p-5 md:p-6"><h2 className="font-semibold">Accepted material categories</h2><p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Collectors use these capabilities when selecting a destination.</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">{Object.entries(categoryLabels).map(([value, label]) => { const category = value as WasteCategory; const active = settings.acceptedCategories.includes(category); return <button type="button" key={value} onClick={() => toggleCategory(category)} className="rounded-xl border p-3 text-left text-xs font-medium transition-colors" style={{ borderColor: active ? 'var(--primary)' : 'var(--border)', backgroundColor: active ? 'var(--primary-subtle)' : '#fff', color: active ? 'var(--primary)' : 'var(--text-primary)' }}>{label}</button>; })}</div></section></div><aside className="flex flex-col gap-5"><section className="card p-5"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>{user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><h2 className="font-bold mt-4">{user?.name}</h2><span className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><BadgeCheck size={13} /> Verified recycler</span><p className="text-xs leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={14} className="inline mr-1" /> Facility actions are recorded in every lot’s chain of custody.</p></section><section className="card p-5"><h2 className="font-semibold flex items-center gap-2"><Award size={17} style={{ color: '#9333ea' }} /> Certifications</h2><div className="flex flex-col gap-2 mt-4">{settings.certifications.map((item) => <div key={item} className="rounded-lg border p-2.5 flex items-center gap-2 text-xs" style={{ borderColor: 'var(--border)' }}><span className="flex-1">{item}</span><button type="button" onClick={() => setSettings({ ...settings, certifications: settings.certifications.filter((candidate) => candidate !== item) })} aria-label={`Remove ${item}`}><X size={14} style={{ color: 'var(--text-secondary)' }} /></button></div>)}</div><div className="flex gap-2 mt-3"><input value={certificate} onChange={(event) => setCertificate(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCertificate(); } }} placeholder="Add certification" className="min-w-0 flex-1 border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} /><Button size="sm" leftIcon={<Plus size={14} />} onClick={addCertificate}>Add</Button></div></section><Button type="submit" fullWidth isLoading={saving}>Save facility profile</Button><Button variant="outline" fullWidth leftIcon={<RotateCcw size={15} />} disabled={authMode !== 'demo'} onClick={() => setResetOpen(true)}>Reset demo marketplace</Button></aside></form><Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset shared demo data" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetDemoData(); setResetOpen(false); showToast('Demo marketplace restored.', 'success'); }}>Reset data</Button></div>}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This restores all shared role data. Your facility contact details remain unchanged.</p></Modal></div>;
};

export default RecyclerProfilePage;
