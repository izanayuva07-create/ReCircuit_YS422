import React, { useMemo, useState } from 'react';
import { CalendarClock, MapPin, Navigation, PackageCheck, Phone, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import StatusBadge from '../../components/StatusBadge';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import type { PickupStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const ordered: PickupStatus[] = ['confirmed', 'on_the_way', 'arrived', 'otp_verification', 'completed'];
const labels: Record<string, string> = { confirmed: 'Confirmed', collector_assigned: 'Confirmed', on_the_way: 'On the way', arrived: 'Arrived', otp_verification: 'OTP hand-off', completed: 'Completed' };

const CollectorPickupPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { bookings, listings, bids, getBooking, updateBookingStatus, verifyBookingOtp } = usePlatform();
  const booking = getBooking(id) ?? bookings.find((item) => item.id === id);
  const listing = listings.find((item) => item.id === booking?.listingId);
  const bid = bids.find((item) => item.id === booking?.bidId);
  const [otp, setOtp] = useState('');

  const steps = useMemo(() => {
    const current = booking?.status === 'collector_assigned' ? 'confirmed' : booking?.status;
    const currentIndex = current ? ordered.indexOf(current) : -1;
    return ordered.map((stage, index) => ({ label: labels[stage], status: (index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming' }));
  }, [booking?.status]);

  if (!booking) return <div className="max-container py-10"><EmptyState title="Pickup not found" description="This pickup is no longer available." actionLabel="View jobs" onAction={() => navigate('/collector/jobs')} /></div>;

  const advance = () => {
    const next: Partial<Record<PickupStatus, PickupStatus>> = { confirmed: 'on_the_way', collector_assigned: 'on_the_way', on_the_way: 'arrived', arrived: 'otp_verification' };
    const nextStatus = next[booking.status];
    if (!nextStatus) return;
    updateBookingStatus(booking.id, nextStatus);
    showToast(`Pickup updated: ${labels[nextStatus]}.`, 'success');
  };

  const verify = () => {
    if (verifyBookingOtp(booking.id, otp)) {
      showToast('Hand-off complete. The item is now in inventory.', 'success');
      navigate('/collector/inventory');
    } else showToast('Incorrect OTP. Check the code with the source.', 'error');
  };

  const buttonLabels: Partial<Record<PickupStatus, string>> = { confirmed: 'Start journey', collector_assigned: 'Start journey', on_the_way: 'I have arrived', arrived: 'Start OTP verification' };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader backTo="/collector/jobs" eyebrow="Active pickup" title={listing?.itemName ?? 'Scheduled pickup'} description={`Booking ${booking.id}`} actions={<StatusBadge status={booking.status} />} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="flex flex-col gap-5">
          <section className="card p-5 md:p-6">
            <h2 className="font-semibold">Pickup details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div className="flex gap-3"><MapPin size={18} style={{ color: 'var(--primary)' }} /><div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Address</p><p className="text-sm font-medium mt-1">{booking.pickupAddress}</p></div></div>
              <div className="flex gap-3"><CalendarClock size={18} style={{ color: 'var(--primary)' }} /><div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Scheduled</p><p className="text-sm font-medium mt-1">{formatDate(booking.scheduledAt, true)}</p></div></div>
              <div className="flex gap-3"><Phone size={18} style={{ color: 'var(--primary)' }} /><div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Source contact</p><p className="text-sm font-medium mt-1">Available through verified booking</p></div></div>
              <div className="flex gap-3"><PackageCheck size={18} style={{ color: 'var(--primary)' }} /><div><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Agreed value</p><p className="text-sm font-medium mt-1">{formatCurrency(bid?.offeredPrice ?? listing?.expectedPrice ?? 0)}</p></div></div>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickupAddress)}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}><Navigation size={16} /> Open directions</a>
          </section>

          <section className="card p-5 flex gap-3">
            <ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div><h2 className="text-sm font-semibold">Safe hand-off checklist</h2><p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>Confirm the item and condition, wear appropriate protection, record the OTP only after taking possession, and secure batteries separately for transport.</p></div>
          </section>
        </div>

        <section className="card p-5 h-fit">
          <h2 className="font-semibold">Live progress</h2>
          <ProgressStepper steps={steps} className="mt-5" />
          {booking.status === 'otp_verification' ? (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <label htmlFor="pickup-otp" className="text-sm font-medium">Source OTP</label>
              <input id="pickup-otp" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="0000" className="w-full border rounded-xl px-4 py-3 text-center tracking-[0.4em] font-bold text-lg mt-2 outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} />
              <Button fullWidth className="mt-3" onClick={verify}>Verify & complete</Button>
            </div>
          ) : buttonLabels[booking.status] ? (
            <Button fullWidth className="mt-5" onClick={advance}>{buttonLabels[booking.status]}</Button>
          ) : booking.status === 'completed' ? (
            <Button fullWidth variant="secondary" leftIcon={<PackageCheck size={17} />} className="mt-5" onClick={() => navigate('/collector/inventory')}>View inventory</Button>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default CollectorPickupPage;
