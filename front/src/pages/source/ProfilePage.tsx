import React, { useState } from 'react';
import { CalendarDays, Mail, MapPin, Phone, RotateCcw, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate } from './sourceUtils';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  location: string;
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useAppContext();
  const { listings, bookings, resetDemoData } = usePlatform();
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const setField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: ProfileErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Enter at least two characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) nextErrors.phone = 'Enter a valid phone number with 10 to 15 digits.';
    if (form.location.trim().length < 3) nextErrors.location = 'Enter your city or locality.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        location: form.location.trim(),
      });
      showToast('Profile updated successfully.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update your profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetData = async () => {
    try {
      await resetDemoData();
      showToast('Demo marketplace data restored.', 'success');
      setConfirmReset(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not reset demo data.', 'error');
    }
  };

  const myListings = listings.filter((listing) => !user?.id || listing.sourceId === user.id);
  const myBookings = bookings.filter((booking) => !user?.id || booking.sourceId === user.id);
  const initials = user?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'S';

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Keep your contact and pickup location accurate for smooth collector coordination."
      />

      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="flex flex-col gap-5">
          <section className="card p-5 text-center">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-3xl object-cover" /> : initials}
            </div>
            <h2 className="font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{user?.name ?? 'Source user'}</h2>
            <span className="inline-flex mt-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              {user?.role ?? 'source'} account
            </span>
            <div className="mt-5 pt-4 border-t text-left flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
              <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><Mail size={14} /> <span className="truncate">{user?.email ?? '—'}</span></p>
              <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><CalendarDays size={14} /> Joined {user?.createdAt ? formatDate(user.createdAt) : 'recently'}</p>
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <StatCard label="Listings created" value={myListings.length} icon="PackageCheck" />
            <StatCard label="Tracked pickups" value={myBookings.length} icon="Truck" color="#2563eb" />
          </section>
        </aside>

        <div className="flex flex-col gap-5 min-w-0">
          <form onSubmit={saveProfile} className="card p-5 md:p-7">
            <div className="flex items-center gap-2 mb-6">
              <UserRound size={20} style={{ color: 'var(--primary)' }} />
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Personal details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                leftIcon={<UserRound size={16} />}
                error={errors.name}
                autoComplete="name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                leftIcon={<Mail size={16} />}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                leftIcon={<Phone size={16} />}
                placeholder="+91 98765 43210"
                error={errors.phone}
                autoComplete="tel"
                required
              />
              <Input
                label="City or locality"
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                leftIcon={<MapPin size={16} />}
                placeholder="Example: Anna Nagar, Chennai"
                error={errors.location}
                autoComplete="address-level2"
                required
              />
            </div>
            <div className="flex justify-end mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button type="submit" isLoading={isSaving}>Save changes</Button>
            </div>
          </form>

          <section className="card p-5 md:p-7">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Privacy & handover safety</h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your pickup address is used to coordinate accepted bookings. Always remove SIM cards, memory cards, and personal data before handover.
                </p>
              </div>
            </div>
          </section>

          <section className="card p-5 md:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} style={{ color: 'var(--text-secondary)' }} />
                  <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Restore demo marketplace data</h2>
                </div>
                <p className="text-xs mt-1 max-w-lg" style={{ color: 'var(--text-secondary)' }}>Replaces marketplace listings, bids, bookings, lots, notifications, and transactions with the original local demo data.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
            </div>
          </section>
        </div>
      </div>

      <Modal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore demo data?"
        size="sm"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep current data</Button>
            <Button variant="danger" onClick={resetData}>Restore demo data</Button>
          </div>
        )}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Listings and workflow changes made on this device will be replaced. Your signed-in profile is not changed.
        </p>
      </Modal>
    </div>
  );
};

export default ProfilePage;
