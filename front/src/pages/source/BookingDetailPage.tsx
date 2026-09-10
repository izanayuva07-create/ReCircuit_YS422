import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle2, Copy, MapPin, Package, ShieldCheck, Truck } from 'lucide-react';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import StatusBadge from '../../components/StatusBadge';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate, getBookingSteps } from './sourceUtils';

const BookingDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { getBooking, getListing, updateBookingStatus } = usePlatform();
  const booking = getBooking(id);
  const listing = booking ? getListing(booking.listingId) : undefined;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  if (!booking) {
    return (
      <div className="max-container py-8">
        <PageHeader title="Booking not found" description="This pickup may have been removed or the link is no longer valid." backTo="/source/bookings" />
        <div className="card mt-6">
          <EmptyState icon={CalendarDays} title="We could not find that booking" actionLabel="View bookings" onAction={() => navigate('/source/bookings')} />
        </div>
      </div>
    );
  }

  const canCancel = ['confirmed', 'collector_assigned'].includes(booking.status);
  const showOtp = Boolean(booking.otp) && !['completed', 'cancelled'].includes(booking.status);

  const copyOtp = async () => {
    if (!booking.otp) return;
    try {
      await navigator.clipboard.writeText(booking.otp);
      showToast('Pickup OTP copied.', 'success');
    } catch {
      showToast(`Your pickup OTP is ${booking.otp}.`, 'info');
    }
  };

  const cancelBooking = async () => {
    setIsWorking(true);
    try {
      await updateBookingStatus(booking.id, 'cancelled');
      showToast('Pickup booking cancelled.', 'success');
      setConfirmCancel(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not cancel the booking.', 'error');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Pickup tracking"
        title={listing?.itemName ?? 'E-waste pickup'}
        description={`Booking ${booking.id}`}
        backTo="/source/bookings"
        actions={canCancel ? <Button variant="danger" size="sm" onClick={() => setConfirmCancel(true)}>Cancel pickup</Button> : undefined}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={booking.status} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {booking.otpVerified ? 'Handover identity verified' : 'Protected by pickup OTP'}
        </span>
      </div>

      {booking.status === 'cancelled' && (
        <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <AlertTriangle size={19} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>This pickup was cancelled</p>
            <p className="text-xs mt-1" style={{ color: '#991b1b' }}>The collector should not arrive for this booking. You can create a new listing when ready.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <section className="card p-5 md:p-6 overflow-hidden">
            <h2 className="font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Live pickup progress</h2>
            <div className="hidden sm:block">
              <ProgressStepper steps={getBookingSteps(booking)} orientation="horizontal" />
            </div>
            <div className="sm:hidden">
              <ProgressStepper steps={getBookingSteps(booking)} orientation="vertical" />
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Pickup details</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collector</dt>
                <dd className="text-sm font-semibold mt-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Truck size={16} style={{ color: 'var(--primary)' }} /> {booking.collectorName}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Scheduled for</dt>
                <dd className="text-sm font-semibold mt-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><CalendarDays size={16} style={{ color: 'var(--primary)' }} /> {formatDate(booking.scheduledAt, true)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pickup address</dt>
                <dd className="text-sm font-semibold mt-1 flex items-start gap-2" style={{ color: 'var(--text-primary)' }}><MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} /> {booking.pickupAddress}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Booked on</dt>
                <dd className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{formatDate(booking.createdAt, true)}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>OTP verification</dt>
                <dd className="text-sm font-semibold mt-1" style={{ color: booking.otpVerified ? 'var(--success)' : 'var(--text-primary)' }}>
                  {booking.otpVerified ? 'Verified' : booking.status === 'cancelled' ? 'Not applicable' : 'Pending'}
                </dd>
              </div>
            </dl>
          </section>

          {listing && (
            <Link to={`/source/listing/${listing.id}`} className="card p-4 flex items-center gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                {listing.images[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Related listing</p>
                <p className="font-semibold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{listing.itemName}</p>
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>View</span>
            </Link>
          )}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
          {showOtp && (
            <section className="card p-5 text-center overflow-hidden relative">
              <div className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <ShieldCheck size={22} />
              </div>
              <h2 className="font-bold mt-3" style={{ color: 'var(--text-primary)' }}>Pickup OTP</h2>
              <div className="flex justify-center gap-2 my-4" aria-label={`Pickup OTP ${booking.otp}`}>
                {booking.otp?.split('').map((digit, index) => (
                  <span key={`${digit}-${index}`} className="w-10 h-12 rounded-lg flex items-center justify-center text-xl font-bold border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
                    {digit}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" leftIcon={<Copy size={14} />} onClick={copyOtp}>Copy OTP</Button>
              <p className="text-xs leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>
                Share this only when the named collector has arrived and you are handing over the item.
              </p>
            </section>
          )}

          {booking.otpVerified && (
            <section className="card p-5" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              <CheckCircle2 size={23} style={{ color: 'var(--primary)' }} />
              <h2 className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>Handover verified</h2>
              <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>The OTP was verified successfully and this pickup is part of the traceable recycling chain.</p>
            </section>
          )}

          {!showOtp && !booking.otpVerified && booking.status !== 'cancelled' && (
            <section className="card p-5">
              <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
              <h2 className="font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>OTP will appear here</h2>
              <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>A secure handover code is generated for tracked pickups.</p>
            </section>
          )}
        </aside>
      </div>

      <Modal
        isOpen={confirmCancel}
        onClose={() => !isWorking && setConfirmCancel(false)}
        title="Cancel this pickup?"
        size="sm"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmCancel(false)} disabled={isWorking}>Keep booking</Button>
            <Button variant="danger" onClick={cancelBooking} isLoading={isWorking}>Cancel pickup</Button>
          </div>
        )}
      >
        <div className="flex gap-3">
          <AlertTriangle size={20} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>The collector will be notified that this appointment is cancelled. The listing remains in your history.</p>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;
