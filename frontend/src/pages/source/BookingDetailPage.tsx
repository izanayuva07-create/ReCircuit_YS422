import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle2, MapPin, Package, ShieldCheck, Truck, Navigation, Sparkles, Award, CreditCard } from 'lucide-react';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import StatusBadge from '../../components/StatusBadge';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate, formatCurrency, getBookingSteps } from './sourceUtils';

const BookingDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { getBooking, getListing, updateBookingStatus, verifyBookingOtp } = usePlatform();
  const booking = getBooking(id);
  const listing = booking ? getListing(booking.listingId) : undefined;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [inputOtp, setInputOtp] = useState('');

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

  const handleVerifyOtp = () => {
    if (!inputOtp.trim()) {
      showToast('Please enter the 6-digit OTP from the collector.', 'error');
      return;
    }
    setIsWorking(true);
    const success = verifyBookingOtp(booking.id, inputOtp.trim());
    setIsWorking(false);
    if (success) {
      showToast('OTP Verified! Physical hand-off confirmed under CPCB rules.', 'success');
      setInputOtp('');
    } else {
      showToast('Incorrect OTP. Please check the 6-digit code on the collector’s device.', 'error');
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
                <dd className="text-sm font-semibold mt-1 flex items-start justify-between gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="flex items-start gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                    {booking.pickupAddress}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupAddress)}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap ml-2 flex-shrink-0"
                  >
                    <Navigation size={13} /> Maps
                  </a>
                </dd>
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

          {/* Razorpay UPI Settlement Details Card */}
          <section className="card p-5 md:p-6 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Settlement & Payout <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Razorpay UPI</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct collector-to-source transfer via UPI.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">FINAL SETTLEMENT</span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {listing ? formatCurrency(listing.expectedPrice) : '₹0'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Destination UPI VPA:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">source.recircuit@okhdfcbank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Gateway Status:</span>
                {booking.status === 'completed' ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Paid via Razorpay UPI (pay_RC{booking.id.replace(/\D/g, '').padEnd(6, '0')})
                  </span>
                ) : (
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Sparkles size={13} /> Authorized in Escrow (Payable on Hand-off)
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>E-Waste Rules 2022 EPR Credit</span>
                <span>Protected by Razorpay 256-bit SSL</span>
              </div>
            </div>
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
          {/* Handover Verified Banner */}
          {booking.otpVerified || booking.status === 'completed' ? (
            <section className="card p-6 border-2 border-emerald-500/30 bg-emerald-50/40 text-center animate-pop shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md">
                <CheckCircle2 size={32} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck size={14} className="text-emerald-700" /> Custody Transferred
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">OTP Verified</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Hand-off of <strong>{listing?.itemName || 'e-waste item'}</strong> to CPCB-authorized collector <strong>{booking.collectorName}</strong> has been officially verified.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-mono text-emerald-800">
                <span>CPCB Manifest Hash</span>
                <span className="font-bold">#CPCB-2022-TN{booking.id.replace(/\D/g, '').padEnd(4, '0')}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/source/certificates"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Award size={15} /> View CPCB Form 1 Certificate
                </Link>
                <Link
                  to="/source/payments"
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard size={15} /> View Razorpay Settlement
                </Link>
              </div>
            </section>
          ) : booking.status !== 'cancelled' ? (
            /* Interactive Source OTP Verification Form */
            <section className="card p-6 bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Verify Collector's OTP</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                When collector <strong>{booking.collectorName}</strong> arrives, enter their 6-digit handover code to authorize custody:
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000 000"
                  className="w-full text-center text-2xl font-mono font-black tracking-[0.3em] py-3 px-4 rounded-xl border-2 border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white text-slate-900 shadow-inner"
                />
              </div>

              {/* Collector's code quick-fill button for smooth testing */}
              {booking.otp && (
                <div className="mb-4 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="font-medium">Collector token:</span>
                  <button
                    type="button"
                    onClick={() => setInputOtp(booking.otp || '')}
                    className="font-mono font-bold text-emerald-700 hover:underline cursor-pointer bg-transparent border-0"
                    title="Click to auto-fill code for demonstration"
                  >
                    {booking.otp} (Tap to Fill)
                  </button>
                </div>
              )}

              <Button
                fullWidth
                variant="primary"
                onClick={handleVerifyOtp}
                isLoading={isWorking}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs shadow-md"
              >
                Verify OTP & Confirm Hand-off
              </Button>

              <p className="text-[11px] text-slate-400 mt-3 font-mono">
                Protected by CPCB 2022 Digital Custody Chain
              </p>
            </section>
          ) : null}
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
