import React, { useMemo, useState } from 'react';
import { Banknote, BriefcaseBusiness, MapPin, PackageSearch, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Select from '../../components/Select';
import StatusBadge from '../../components/StatusBadge';
import WasteCard from '../../components/WasteCard';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { categoryLabels, formatCurrency, formatDate } from '../../utils/format';

const tabs = [
  { label: 'Available', value: 'available' },
  { label: 'My bids', value: 'bids' },
  { label: 'Accepted', value: 'accepted' },
];

const CollectorJobsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { listings, bids, bookings, placeBid, withdrawBid } = usePlatform();
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [offer, setOffer] = useState('');
  const [notes, setNotes] = useState('');

  const myBids = useMemo(
    () => bids.filter((bid) => bid.collectorId === user?.id || bid.collectorName === user?.name),
    [bids, user?.id, user?.name],
  );

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (!['active', 'bidding'].includes(listing.status)) return false;
      if (category !== 'all' && listing.category !== category) return false;
      return !normalized || `${listing.itemName} ${listing.pickupAddress} ${listing.description ?? ''}`.toLowerCase().includes(normalized);
    });
  }, [category, listings, query]);

  const accepted = useMemo(() => myBids.filter((bid) => bid.status === 'accepted'), [myBids]);
  const selectedListing = listings.find((listing) => listing.id === selectedId);

  const openBid = (listingId: string) => {
    const listing = listings.find((item) => item.id === listingId);
    const previous = myBids.find((bid) => bid.listingId === listingId && bid.status !== 'withdrawn');
    if (previous) {
      showToast('You already have an active bid on this listing.', 'info');
      setTab('bids');
      return;
    }
    setSelectedId(listingId);
    setOffer(String(listing?.expectedPrice ?? ''));
    setNotes('');
  };

  const submitBid = () => {
    const amount = Number(offer);
    if (!selectedId || !Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid bid amount.', 'error');
      return;
    }
    placeBid(selectedId, { offeredPrice: amount, notes: notes.trim() || undefined });
    showToast('Bid placed successfully.', 'success');
    setSelectedId(null);
    setTab('bids');
  };

  const handleWithdraw = (bidId: string) => {
    withdrawBid(bidId);
    showToast('Bid withdrawn.', 'info');
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader
        eyebrow="Marketplace"
        title="Collection jobs"
        description="Browse active listings, make fair offers, and track accepted pickups."
      />

      <FilterBar filters={tabs} active={tab} onChange={setTab} />

      {tab === 'available' && (
        <>
          <div className="card p-4 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Search by item or location" />
            <Select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={[
                { label: 'All categories', value: 'all' },
                ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{visibleListings.length}</strong> listings found</p>
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}><SlidersHorizontal size={14} /> Updated live from shared listings</span>
          </div>

          {visibleListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleListings.map((listing) => <WasteCard key={listing.id} listing={listing} role="collector" onBid={openBid} />)}
            </div>
          ) : (
            <EmptyState icon={PackageSearch} title="No matching jobs" description="Try a different item, location, or category." actionLabel="Clear filters" onAction={() => { setQuery(''); setCategory('all'); }} />
          )}
        </>
      )}

      {tab === 'bids' && (
        myBids.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myBids.map((bid) => {
              const listing = listings.find((item) => item.id === bid.listingId);
              return (
                <article key={bid.id} className="card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{listing?.itemName ?? 'Unavailable listing'}</p>
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><MapPin size={12} /> {listing?.pickupAddress ?? 'Address unavailable'}</p>
                    </div>
                    <StatusBadge status={bid.status} />
                  </div>
                  <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--primary-subtle)' }}>
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><Banknote size={17} /> Your offer</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(bid.offeredPrice)}</span>
                  </div>
                  {bid.notes && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>“{bid.notes}”</p>}
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Placed {formatDate(bid.createdAt, true)}</p>
                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" className="flex-1" onClick={() => navigate(`/collector/jobs/${bid.listingId}`)}>View listing</Button>
                    {bid.status === 'pending' && <Button variant="danger" className="flex-1" onClick={() => handleWithdraw(bid.id)}>Withdraw</Button>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={BriefcaseBusiness} title="No bids yet" description="Browse available jobs and place your first bid." actionLabel="Browse jobs" onAction={() => setTab('available')} />
      )}

      {tab === 'accepted' && (
        accepted.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accepted.map((bid) => {
              const listing = listings.find((item) => item.id === bid.listingId);
              const booking = bookings.find((item) => item.bidId === bid.id);
              return (
                <button
                  type="button"
                  key={bid.id}
                  className="card p-5 text-left hover:border-green-300 transition-colors"
                  onClick={() => navigate(booking ? `/collector/pickups/${booking.id}` : `/collector/jobs/${bid.listingId}`)}
                >
                  <div className="flex justify-between gap-3"><p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{listing?.itemName ?? 'Pickup'}</p>{booking && <StatusBadge status={booking.status} />}</div>
                  <p className="text-sm mt-2" style={{ color: 'var(--primary)' }}>{formatCurrency(bid.offeredPrice)}</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{booking ? formatDate(booking.scheduledAt, true) : 'Waiting for pickup schedule'}</p>
                </button>
              );
            })}
          </div>
        ) : <EmptyState icon={BriefcaseBusiness} title="No accepted jobs" description="Accepted bids and scheduled pickups will appear here." />
      )}

      <Modal
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedId(null)}
        title={`Place bid · ${selectedListing?.itemName ?? ''}`}
        footer={<div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button><Button onClick={submitBid}>Place bid</Button></div>}
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-3 text-sm flex justify-between" style={{ backgroundColor: 'var(--primary-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Source estimate</span>
            <strong style={{ color: 'var(--primary)' }}>{formatCurrency(selectedListing?.expectedPrice ?? 0)}</strong>
          </div>
          <div>
            <label htmlFor="job-bid-offer" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Offer amount (₹)</label>
            <input id="job-bid-offer" type="number" min="1" value={offer} onChange={(event) => setOffer(event.target.value)} className="w-full border rounded-lg px-3 py-2.5 mt-1.5 outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} />
          </div>
          <div>
            <label htmlFor="job-bid-notes" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Pickup note <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>(optional)</span></label>
            <textarea id="job-bid-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Example: I can collect this evening" className="w-full border rounded-lg px-3 py-2.5 mt-1.5 resize-none outline-none focus:ring-2 focus:ring-green-100" style={{ borderColor: 'var(--border)' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollectorJobsPage;
