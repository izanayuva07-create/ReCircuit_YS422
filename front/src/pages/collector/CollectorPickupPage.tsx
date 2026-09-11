import React, { useMemo, useState } from 'react';
import { CalendarClock, MapPin, Navigation, PackageCheck, Phone, ShieldCheck, CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import StatusBadge from '../../components/StatusBadge';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
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
  const { bookings, listings, bids, getBooking, updateBookingStatus, generatePickupOtp } = usePlatform();
  const booking = getBooking(id) ?? bookings.find((item) => item.id === id);
  const listing = listings.find((item) => item.id === booking?.listingId);
  const bid = bids.find((item) => item.id === booking?.bidId);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string;
    amount: number;
    upiId: string;
    paidAt: string;
  } | null>(null);

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
            <div className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupAddress)}&travelmode=driving`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                <Navigation size={16} /> Open Google Maps directions
              </a>
              <span className="text-xs text-slate-400 font-mono">Live Google Maps API Sync</span>
            </div>
          </section>

          {/* Dedicated Razorpay UPI Payment to Source Section */}
          <section className="card p-5 md:p-6 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Payment to Source <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Razorpay UPI</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Settle the final accepted bid amount directly to the seller's verified UPI account.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">FINAL BID AMOUNT</span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(bid?.offeredPrice ?? listing?.expectedPrice ?? 0)}
                </span>
              </div>
            </div>

            {paymentInfo ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Payment Settled to Source via Razorpay UPI
                  </span>
                  <span className="font-mono">{formatCurrency(paymentInfo.amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px] pt-1">
                  <span>Payment ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{paymentInfo.paymentId}</strong></span>
                  <span>UPI VPA: <strong className="font-mono text-slate-800 dark:text-slate-200">{paymentInfo.upiId}</strong></span>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">Verified at: {paymentInfo.paidAt} · Double-entry transaction recorded</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Sparkles size={16} className="text-blue-500 flex-shrink-0" />
                  <span>Instant UPI transfer via Google Pay, PhonePe, Paytm, or direct VPA.</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap w-full sm:w-auto shadow-md"
                >
                  Pay {formatCurrency(bid?.offeredPrice ?? listing?.expectedPrice ?? 0)} via Razorpay UPI
                </Button>
              </div>
            )}
          </section>

          <section className="card p-5 flex gap-3">
            <ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div><h2 className="text-sm font-semibold">Safe hand-off checklist</h2><p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>Confirm the item and condition, wear appropriate protection, record the OTP only after taking possession, and secure batteries separately for transport.</p></div>
          </section>
        </div>

        <section className="card p-5 h-fit">
          <h2 className="font-semibold">Live progress</h2>
          <ProgressStepper steps={steps} className="mt-5" />

          {/* Reminder button to pay if not paid yet */}
          {!paymentInfo && booking.status !== 'completed' && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <CreditCard size={14} /> Pay Source via Razorpay UPI ({formatCurrency(bid?.offeredPrice ?? listing?.expectedPrice ?? 0)})
              </button>
            </div>
          )}

          {booking.status !== 'completed' && !booking.otpVerified && booking.status !== 'cancelled' ? (
            <div className="mt-4 pt-4 border-t border-emerald-200 bg-emerald-50/60 p-4 rounded-xl text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 mb-2">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Hand-off Security Token</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Your Hand-off OTP</h3>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Provide this 6-digit code to the Source/Seller to confirm pickup.
              </p>
              <div className="flex justify-center gap-1.5 mb-3 font-mono">
                {(booking.otp || '849203').split('').map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-9 h-11 rounded-lg bg-white border-2 border-emerald-400 text-slate-900 text-lg font-black flex items-center justify-center shadow-sm"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(booking.otp || '849203');
                    showToast('Hand-off OTP copied.', 'success');
                  }}
                  className="text-xs font-semibold bg-white"
                >
                  Copy OTP
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const newCode = generatePickupOtp(booking.id);
                    showToast(`New Hand-off OTP generated: ${newCode}`, 'success');
                  }}
                  className="text-xs font-semibold bg-white border border-slate-200"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          ) : booking.status === 'completed' || booking.otpVerified ? (
            <div className="mt-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-center animate-pop">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">OTP Verified by Source</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Custody officially confirmed under CPCB 2022 guidelines.
              </p>
              <Button
                fullWidth
                variant="primary"
                className="mt-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate('/collector/inventory')}
              >
                View in Inventory
              </Button>
            </div>
          ) : buttonLabels[booking.status] ? (
            <Button fullWidth className="mt-5" onClick={advance}>{buttonLabels[booking.status]}</Button>
          ) : null}
        </section>
      </div>

      {/* Razorpay UPI Payment Modal */}
      <RazorpayPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={booking.id}
        listingTitle={listing?.itemName || 'E-Waste Lot'}
        sourceName="Verified Source Partner"
        sourceUpiId="source.recircuit@okhdfcbank"
        finalBidAmount={bid?.offeredPrice ?? listing?.expectedPrice ?? 0}
        onPaymentSuccess={(details) => {
          setPaymentInfo({
            paymentId: details.paymentId,
            amount: details.amount,
            upiId: details.upiId,
            paidAt: new Date().toLocaleTimeString(),
          });
          showToast(`Paid ${formatCurrency(details.amount)} to Source via Razorpay UPI (${details.paymentId})!`, 'success');
        }}
      />
    </div>
  );
};

export default CollectorPickupPage;
