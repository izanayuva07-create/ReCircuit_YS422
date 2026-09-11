import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Banknote,
  Box,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  Weight,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import StatusBadge from '../../components/StatusBadge';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { PickupStatus } from '../../types';
import { categoryLabels, conditionLabels, formatCurrency, formatDate } from '../../utils/format';

const bookingStages: PickupStatus[] = ['confirmed', 'on_the_way', 'arrived', 'otp_verification', 'completed'];

const stageLabel: Record<PickupStatus, string> = {
  confirmed: 'Confirmed',
  collector_assigned: 'Assigned',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  otp_verification: 'Verify OTP',
  completed: 'Collected',
  cancelled: 'Cancelled',
};

const CollectorJobDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { listings, bids, bookings, getListing, placeBid, withdrawBid, updateBookingStatus, generatePickupOtp } = usePlatform();
  const navigate = useNavigate();

  const listing = getListing(id) ?? listings.find((item) => item.id === id);
  const myBid = bids.find((bid) => bid.listingId === listing?.id && (bid.collectorId === user?.id || bid.collectorName === user?.name) && bid.status !== 'withdrawn');
  const booking = bookings.find((item) => item.listingId === listing?.id && (!myBid || item.bidId === myBid.id));

  const [offer, setOffer] = useState(String(listing?.expectedPrice ?? ''));
  const [notes, setNotes] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ paid: boolean; paymentId?: string; upiId?: string } | null>(null);

  const steps = useMemo(() => {
    const activeIndex = booking ? bookingStages.indexOf(booking.status === 'collector_assigned' ? 'confirmed' : booking.status) : -1;
    return bookingStages.map((stage, index) => ({
      label: stageLabel[stage],
      status: (index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
    }));
  }, [booking]);

  if (!listing) {
    return (
      <div className="max-container py-10">
        <EmptyState title="Listing not found" description="This collection opportunity may have been removed." actionLabel="Back to jobs" onAction={() => navigate('/collector/jobs')} />
      </div>
    );
  }

  const payableAmount = myBid?.offeredPrice ?? listing.expectedPrice;

  const submitBid = () => {
    const amount = Number(offer);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid offer amount.', 'error');
      return;
    }
    placeBid(listing.id, { offeredPrice: amount, notes: notes.trim() || undefined });
    showToast('Bid sent to the source.', 'success');
  };

  const advancePickup = () => {
    if (!booking) return;
    const next: Partial<Record<PickupStatus, PickupStatus>> = {
      confirmed: 'on_the_way',
      collector_assigned: 'on_the_way',
      on_the_way: 'arrived',
      arrived: 'otp_verification',
    };
    const nextStatus = next[booking.status];
    if (nextStatus) {
      updateBookingStatus(booking.id, nextStatus);
      showToast(`Pickup marked ${stageLabel[nextStatus].toLowerCase()}.`, 'success');
    }
  };

  const actionLabel: Partial<Record<PickupStatus, string>> = {
    confirmed: 'Start journey',
    collector_assigned: 'Start journey',
    on_the_way: 'Mark arrived',
    arrived: 'Request OTP',
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader
        backTo="/collector/jobs"
        eyebrow="Collection job"
        title={listing.itemName}
        description={`Listed ${formatDate(listing.createdAt, true)}`}
        actions={<StatusBadge status={booking?.status ?? myBid?.status ?? listing.status} />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5">
        <div className="flex flex-col gap-5">
          <section className="card overflow-hidden">
            <div className="h-56 md:h-72 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              {listing.images[0] ? <img src={listing.images[0]} alt={listing.itemName} className="w-full h-full object-cover" /> : <Package size={64} style={{ color: 'var(--primary)' }} />}
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Box, label: 'Category', value: categoryLabels[listing.category] },
                { icon: Package, label: 'Quantity', value: `${listing.quantity} item${listing.quantity === 1 ? '' : 's'}` },
                { icon: Weight, label: 'Weight', value: `${listing.weightKg} kg` },
                { icon: Banknote, label: 'Expected', value: formatCurrency(listing.expectedPrice) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}><Icon size={13} /> {label}</span>
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Item details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
              <div><dt style={{ color: 'var(--text-secondary)' }}>Condition</dt><dd className="font-medium mt-0.5">{conditionLabels[listing.condition]}</dd></div>
              <div>
                <dt style={{ color: 'var(--text-secondary)' }}>Pickup location</dt>
                <dd className="font-medium mt-0.5 flex items-center gap-2">
                  <span>{listing.pickupAddress}</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.pickupAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border"
                    style={{ color: 'var(--primary)', borderColor: 'var(--border)' }}
                    title="Open in Google Maps"
                  >
                    <Navigation size={11} /> Directions
                  </a>
                </dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>{listing.description || 'No additional description was provided.'}</p>
          </section>

          <section className="card p-5 flex gap-3 items-start" style={{ borderColor: listing.condition === 'damaged' ? '#fbbf24' : 'var(--border)' }}>
            {listing.condition === 'damaged' ? <AlertTriangle size={20} className="flex-shrink-0" style={{ color: '#d97706' }} /> : <ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />}
            <div>
              <h2 className="text-sm font-semibold">Collection safety</h2>
              <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                Inspect for swollen batteries, cracks, leaking material, and exposed conductors. Use gloves, isolate batteries, and secure the item before transport.
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          {booking ? (
            <section className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Pickup progress</h2>
                <Truck size={19} style={{ color: 'var(--primary)' }} />
              </div>
              <ProgressStepper steps={steps} className="mt-5" />
              <div className="mt-4 pt-4 border-t flex flex-col gap-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <span className="flex gap-2"><CalendarClock size={14} /> {formatDate(booking.scheduledAt, true)}</span>
                <span className="flex gap-2">
                  <MapPin size={14} /> {booking.pickupAddress}
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickupAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  <Navigation size={13} /> Open Turn-by-Turn in Google Maps
                </a>
                <span className="flex gap-2"><Phone size={14} /> Contact details unlock for accepted pickups</span>
              </div>

              {/* Collector-to-Source Payment section */}
              <div className="mt-5 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Settlement to Source</span>
                  <span className="font-semibold" style={{ color: 'var(--primary)' }}>Final Bid</span>
                </div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{formatCurrency(payableAmount)}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Payable via Razorpay UPI</span>
                </div>

                {paymentInfo?.paid ? (
                  <div className="p-2.5 rounded-lg border flex items-center gap-2 text-xs" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#059669' }}>
                    <CheckCircle2 size={16} />
                    <div>
                      <p className="font-bold">Paid to Source ({listing.pickupAddress.split(',')[0] || 'Verified Generator'})</p>
                      <p className="font-mono text-[10px] text-slate-500">Ref: {paymentInfo.paymentId}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    fullWidth
                    variant="secondary"
                    className="flex items-center justify-center gap-2 text-xs py-2.5"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <CreditCard size={15} /> Pay Source {formatCurrency(payableAmount)} (Razorpay UPI)
                  </Button>
                )}
              </div>

              {/* Collector Generated OTP Section */}
              {booking.status !== 'completed' && !booking.otpVerified && booking.status !== 'cancelled' ? (
                <div className="mt-5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 mb-2">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Collector Hand-off Token</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Your Hand-off OTP</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Provide this 6-digit code to the Source/Seller. They will verify it to confirm transfer.
                  </p>

                  <div className="flex justify-center gap-2 mb-3 font-mono">
                    {(booking.otp || '849203').split('').map((digit, idx) => (
                      <span
                        key={idx}
                        className="w-10 h-12 rounded-xl bg-white border-2 border-emerald-400 text-slate-900 text-xl font-black flex items-center justify-center shadow-sm"
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
                        showToast('Hand-off OTP copied to clipboard.', 'success');
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
                    Physical hand-off confirmed under CPCB E-Waste Rules 2022.
                  </p>
                  <Button
                    fullWidth
                    variant="primary"
                    className="mt-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => navigate('/collector/inventory')}
                  >
                    View in Inventory Lot
                  </Button>
                </div>
              ) : actionLabel[booking.status] ? (
                <Button fullWidth className="mt-5" onClick={advancePickup}>{actionLabel[booking.status]}</Button>
              ) : null}
            </section>
          ) : myBid ? (
            <section className="card p-5">
              <div className="flex justify-between gap-3"><h2 className="font-semibold">Your bid</h2><StatusBadge status={myBid.status} /></div>
              <p className="text-3xl font-bold mt-5" style={{ color: 'var(--primary)' }}>{formatCurrency(myBid.offeredPrice)}</p>
              {myBid.notes && <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>{myBid.notes}</p>}
              {myBid.status === 'pending' && <Button variant="danger" fullWidth className="mt-5" onClick={() => { withdrawBid(myBid.id); showToast('Bid withdrawn.', 'info'); }}>Withdraw bid</Button>}
            </section>
          ) : (
            <section className="card p-5">
              <h2 className="font-semibold">Make an offer</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Offer a fair value based on the description and travel required.</p>
              <label htmlFor="detail-offer" className="block text-sm font-medium mt-5">Offer amount (₹)</label>
              <input id="detail-offer" type="number" min="1" value={offer} onChange={(event) => setOffer(event.target.value)} className="w-full border rounded-xl px-4 py-3 mt-1.5 outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} />
              <label htmlFor="detail-notes" className="block text-sm font-medium mt-4">Pickup note <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>(optional)</span></label>
              <textarea id="detail-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full border rounded-xl px-4 py-3 mt-1.5 resize-none outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} placeholder="When can you collect it?" />
              <Button fullWidth className="mt-4" onClick={submitBid}>Place bid</Button>
            </section>
          )}
        </aside>
      </div>

      {booking && (
        <RazorpayPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          bookingId={booking.id}
          listingTitle={listing.itemName}
          sourceName={listing.pickupAddress.split(',')[0] || 'Verified Source Partner'}
          sourceUpiId="source.recircuit@okhdfcbank"
          finalBidAmount={payableAmount}
          onPaymentSuccess={(details) => {
            setPaymentInfo({ paid: true, paymentId: details.paymentId, upiId: details.upiId });
            showToast(`Settlement of ${formatCurrency(payableAmount)} transferred to Source via Razorpay UPI!`, 'success');
          }}
        />
      )}
    </div>
  );
};

export default CollectorJobDetailPage;
