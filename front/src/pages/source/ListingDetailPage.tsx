import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ImageOff,
  MapPin,
  Package,
  Pencil,
  Scale,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import BidCard from '../../components/BidCard';
import BidderAnalysisPanel from '../../components/BidderAnalysisPanel';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import TraceabilityTimeline from '../../components/TraceabilityTimeline';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import type { Bid } from '../../types';
import { CATEGORY_LABELS, CONDITION_LABELS, formatCurrency, formatDate, getTraceEvents } from './sourceUtils';

type ConfirmAction = 'cancel' | 'delete' | null;

const futurePickupValue = (): string => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const ListingDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const {
    bookings,
    getListing,
    getBidsForListing,
    acceptBid,
    updateListing,
    deleteListing,
  } = usePlatform();
  const listing = getListing(id);
  const listingBids = getBidsForListing(id);
  const booking = bookings.find((item) => item.listingId === id);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidToAccept, setBidToAccept] = useState<Bid | null>(null);
  const [profileBid, setProfileBid] = useState<Bid | null>(null);
  const [scheduledAt, setScheduledAt] = useState(futurePickupValue);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const traceEvents = useMemo(() => listing ? getTraceEvents(listing, booking) : [], [listing, booking]);

  if (!listing) {
    return (
      <div className="max-container py-8">
        <PageHeader title="Listing not found" description="This listing may have been removed or is no longer available." backTo="/source" />
        <div className="card mt-6">
          <EmptyState title="We could not find that listing" description="Return to your dashboard to see your current e-waste listings." actionLabel="Back to dashboard" onAction={() => navigate('/source')} />
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!bidToAccept) return;
    const pickupDate = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(pickupDate.getTime()) || pickupDate.getTime() <= Date.now()) {
      showToast('Choose a pickup time in the future.', 'error');
      return;
    }

    setIsWorking(true);
    try {
      await acceptBid(bidToAccept.id, pickupDate.toISOString());
      showToast(`${bidToAccept.collectorName}'s bid was accepted.`, 'success');
      setBidToAccept(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not accept this bid.', 'error');
    } finally {
      setIsWorking(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setIsWorking(true);
    try {
      if (confirmAction === 'delete') {
        await deleteListing(listing.id);
        showToast('Listing deleted.', 'success');
        navigate('/source', { replace: true });
      } else {
        await updateListing(listing.id, { status: 'cancelled' });
        showToast('Listing cancelled. It is no longer visible to collectors.', 'success');
        setConfirmAction(null);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Could not ${confirmAction} this listing.`, 'error');
    } finally {
      setIsWorking(false);
    }
  };

  const canCancel = ['draft', 'active', 'bidding'].includes(listing.status);
  const canDelete = ['draft', 'cancelled'].includes(listing.status);
  const acceptedBid = listingBids.find((bid) => bid.status === 'accepted');

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Listing details"
        title={listing.itemName}
        description={`Listed ${formatDate(listing.createdAt)} · ${CATEGORY_LABELS[listing.category]}`}
        backTo="/source"
        actions={(
          <div className="flex flex-wrap gap-2">
            {booking && (
              <Link
                to={`/source/bookings/${booking.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <CalendarClock size={16} /> Track pickup
              </Link>
            )}
            {canCancel && <Button variant="danger" size="sm" onClick={() => setConfirmAction('cancel')}>Cancel listing</Button>}
            {canDelete && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => setConfirmAction('delete')}>Delete</Button>
            )}
          </div>
        )}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={listing.status} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last updated {formatDate(listing.updatedAt, true)}</span>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'bids', label: 'Collector bids', count: listingBids.length },
          { id: 'trace', label: 'Traceability' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
          <div className="flex flex-col gap-5 min-w-0">
            <section className="card p-4 md:p-5">
              {listing.images.length > 0 ? (
                <>
                  <img
                    src={listing.images[Math.min(selectedImage, listing.images.length - 1)]}
                    alt={listing.itemName}
                    className="w-full h-64 sm:h-80 object-contain rounded-xl"
                    style={{ backgroundColor: 'var(--background)' }}
                  />
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {listing.images.map((image, index) => (
                        <button
                          key={`${image.slice(0, 32)}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className="aspect-square rounded-lg overflow-hidden border-2"
                          style={{ borderColor: selectedImage === index ? 'var(--primary)' : 'var(--border)' }}
                          aria-label={`View image ${index + 1}`}
                        >
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-64 rounded-xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}>
                  <ImageOff size={36} />
                  <p className="text-sm">No photos were added</p>
                </div>
              )}
            </section>

            <section className="card p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Item information</h2>
                <Pencil size={17} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ['Category', CATEGORY_LABELS[listing.category]],
                  ['Condition', CONDITION_LABELS[listing.condition]],
                  ['Quantity', `${listing.quantity} item${listing.quantity === 1 ? '' : 's'}`],
                  ['Approximate weight', `${listing.weightKg} kg`],
                  ['Expected price', formatCurrency(listing.expectedPrice)],
                  ['Listing ID', listing.id],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</dt>
                    <dd className="text-sm font-semibold mt-1 break-words" style={{ color: 'var(--text-primary)' }}>{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pickup address</dt>
                  <dd className="text-sm font-semibold mt-1 flex items-start gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} /> {listing.pickupAddress}
                  </dd>
                </div>
                {listing.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Description</dt>
                    <dd className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{listing.description}</dd>
                  </div>
                )}
              </dl>
            </section>

            {listing.aiAnalysis && !listing.aiAnalysis.isLoading && !listing.aiAnalysis.error && (
              <section className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={19} style={{ color: 'var(--primary)' }} />
                  <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Image analysis</h2>
                  <span className="ml-auto text-xs font-semibold" style={{ color: 'var(--primary)' }}>{Math.round(listing.aiAnalysis.confidenceScore * 100)}% confidence</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Detected materials</p>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{listing.aiAnalysis.materialTypes.join(', ') || 'Not identified'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Estimated range</p>
                    <p className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(listing.aiAnalysis.estimatedPriceMin)}–{formatCurrency(listing.aiAnalysis.estimatedPriceMax)}
                    </p>
                  </div>
                </div>
                {listing.aiAnalysis.safetyWarnings.length > 0 && (
                  <div className="mt-4 rounded-xl p-3 flex gap-2" style={{ backgroundColor: '#fffbeb', color: '#92400e' }}>
                    <AlertTriangle size={17} className="flex-shrink-0" />
                    <p className="text-xs">{listing.aiAnalysis.safetyWarnings.join(' ')}</p>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Expected value</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{formatCurrency(listing.expectedPrice)}</p>
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Package size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.quantity} item{listing.quantity === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.weightKg} kg</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Bid summary</h3>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{listingBids.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>offer{listingBids.length === 1 ? '' : 's'} received</p>
              {acceptedBid ? (
                <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: 'var(--primary-subtle)' }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}><CheckCircle2 size={16} /> Bid accepted</div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{acceptedBid.collectorName} · {formatCurrency(acceptedBid.offeredPrice)}</p>
                </div>
              ) : listingBids.length > 0 ? (
                <Button fullWidth className="mt-4" onClick={() => setActiveTab('bids')}>Compare bids</Button>
              ) : (
                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>Verified collectors will see this listing while it is active.</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'bids' && (
        <section>
          {listingBids.length === 0 ? (
            <div className="card">
              <EmptyState title="No collector bids yet" description="Your active listing remains visible to nearby collectors. We will notify you when an offer arrives." />
            </div>
          ) : (
            <>
              <BidderAnalysisPanel
                bids={listingBids}
                expectedPrice={listing.expectedPrice}
                onSelectBid={(bid) => setBidToAccept(bid)}
              />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...listingBids]
                  .sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.offeredPrice - a.offeredPrice)
                  .map((bid) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      showActions={!acceptedBid && canCancel}
                      onAccept={(bidId) => setBidToAccept(listingBids.find((item) => item.id === bidId) ?? null)}
                      onViewProfile={(collectorId) => setProfileBid(listingBids.find((item) => item.collectorId === collectorId) ?? null)}
                    />
                  ))}
              </div>
            </>
          )}
        </section>
      )}

      {activeTab === 'trace' && (
        <section className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start">
          <div className="card p-5 md:p-6">
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Chain of custody</h2>
            <TraceabilityTimeline events={traceEvents} />
          </div>
          <div className="card p-5" style={{ backgroundColor: 'var(--primary-subtle)' }}>
            <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
            <h3 className="font-semibold text-sm mt-3" style={{ color: 'var(--text-primary)' }}>Why traceability matters</h3>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Each confirmed handover creates a clear record from your doorstep to an authorized recycling facility.
            </p>
            <Button
              fullWidth
              variant="outline"
              className="mt-4 bg-white"
              onClick={() => setCertOpen(true)}
            >
              <ShieldCheck size={16} className="mr-2 text-emerald-600" />
              View CPCB Form 1 Certificate
            </Button>
          </div>
        </section>
      )}

      <Modal
        isOpen={Boolean(bidToAccept)}
        onClose={() => !isWorking && setBidToAccept(null)}
        title="Accept collector bid"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBidToAccept(null)} disabled={isWorking}>Keep comparing</Button>
            <Button onClick={handleAccept} isLoading={isWorking}>Confirm pickup</Button>
          </div>
        )}
      >
        {bidToAccept && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{bidToAccept.collectorName}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Offer: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(bidToAccept.offeredPrice)}</strong> · {bidToAccept.distanceKm} km away
              </p>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Preferred pickup date and time
              <input
                type="datetime-local"
                value={scheduledAt}
                min={futurePickupValue()}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-100"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              />
            </label>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Accepting this offer rejects the remaining bids and creates a tracked pickup. Share the OTP only after the collector arrives and you are ready to hand over the item.
            </p>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(profileBid)} onClose={() => setProfileBid(null)} title="Collector profile" size="sm">
        {profileBid && (
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
              {profileBid.collectorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{profileBid.collectorName}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profileBid.collectorRating.toFixed(1)} rating · {profileBid.collectorCompletedPickups} completed pickups</p>
            </div>
            <div className="rounded-xl p-3 flex gap-2" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              <ShieldCheck size={17} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>This collector participates in Re-Circuit’s tracked pickup workflow.</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => !isWorking && setConfirmAction(null)}
        title={confirmAction === 'delete' ? 'Delete listing?' : 'Cancel listing?'}
        size="sm"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isWorking}>Go back</Button>
            <Button variant="danger" onClick={handleConfirmAction} isLoading={isWorking}>
              {confirmAction === 'delete' ? 'Delete permanently' : 'Cancel listing'}
            </Button>
          </div>
        )}
      >
        <div className="flex gap-3">
          <AlertTriangle size={20} className="flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {confirmAction === 'delete'
              ? 'This removes the listing from this device and cannot be undone.'
              : 'Collectors will no longer be able to bid on this item. Existing pending bids will be closed.'}
          </p>
        </div>
      </Modal>

      <GreenCertificateModal
        isOpen={certOpen}
        onClose={() => setCertOpen(false)}
        certificateData={{
          itemName: listing.itemName,
          category: CATEGORY_LABELS[listing.category],
          weightKg: listing.weightKg,
          collectorName: acceptedBid?.collectorName || 'EcoLogix Logistics (CPCB/REG/2023)',
        }}
      />
    </div>
  );
};

export default ListingDetailPage;
