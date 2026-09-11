import React, { useMemo, useState } from 'react';
import { ArrowRight, Banknote, BriefcaseBusiness, CreditCard, IndianRupee, MapPin, PackageCheck, ScanLine, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AwarenessCard from '../../components/AwarenessCard';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import OledHeroBanner from '../../components/OledHeroBanner';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import WasteCard from '../../components/WasteCard';
import MapView from '../../components/MapView';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { awarenessCards } from '../../data/awareness';
import { formatCurrency, formatDate } from '../../utils/format';
import { collectorDemoRoute, collectorMapLocations } from '../../data/locations';

const CollectorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { listings, bids, bookings, inventory, lots, transactions, placeBid } = usePlatform();
  const navigate = useNavigate();
  const [bidListingId, setBidListingId] = useState<string | null>(null);
  const [offer, setOffer] = useState('');

  const available = listings.filter((listing) => ['active', 'bidding'].includes(listing.status));
  const myBids = bids.filter((bid) => bid.collectorId === user?.id || bid.collectorName === user?.name);
  const activeBookings = bookings.filter((booking) => booking.collectorId === user?.id && booking.status !== 'completed' && booking.status !== 'cancelled');
  const totalWeight = inventory.reduce((sum, item) => sum + item.weightKg, 0);
  const myTransactions = transactions.filter((transaction) => !user?.id || transaction.userId === user.id);
  const totalEarnings = myTransactions
    .filter((transaction) => transaction.type === 'earning')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const today = new Date().toDateString();
  const todayEarnings = myTransactions
    .filter((transaction) => transaction.type === 'earning' && new Date(transaction.createdAt).toDateString() === today)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const myLots = lots.filter((lot) => lot.collectorId === user?.id);
  const recyclerMatches = new Set(myLots.filter((lot) => lot.recyclerId).map((lot) => lot.recyclerId)).size || 1;

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === bidListingId),
    [bidListingId, listings],
  );

  const openBid = (listingId: string) => {
    const listing = listings.find((item) => item.id === listingId);
    setBidListingId(listingId);
    setOffer(String(listing?.expectedPrice ?? ''));
  };

  const submitBid = () => {
    if (!bidListingId || !Number.isFinite(Number(offer)) || Number(offer) <= 0) {
      showToast('Enter a valid offer amount.', 'error');
      return;
    }
    placeBid(bidListingId, { offeredPrice: Number(offer) });
    showToast('Your bid has been sent to the source.', 'success');
    setBidListingId(null);
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-8">
      <OledHeroBanner
        imageSrc="/collector-hero-oled.jpg"
        imageAlt="Collector logistics OLED truck hero"
        accentColor="#0f766e"
        accentGlow="rgba(15,118,110,0.55)"
        eyebrow={`Collector Workspace · ${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${user?.name?.split(' ')[0] ?? 'Collector'}`}
        title="Logistics. Verified. Rewarded."
        subtitle="Find nearby pickups, manage hand-offs, scan inventory and build traceable digital lots for certified recyclers."
        stats={[
          { label: 'live jobs', value: String(available.length), icon: BriefcaseBusiness },
          { label: 'active pickups', value: String(activeBookings.length), icon: Truck },
          { label: 'total earned', value: formatCurrency(totalEarnings), icon: IndianRupee },
        ]}
        actions={[
          { label: 'Scan Item', href: '/collector/scan', icon: ScanLine, primary: true },
          { label: 'Find Jobs', href: '/collector/jobs', icon: BriefcaseBusiness },
          { label: 'Payment Gateway', href: '/collector/payments', icon: CreditCard },
          { label: 'Build Lot', href: '/collector/lots/new', icon: PackageCheck },
        ]}
      />

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Available jobs" value={available.length} icon="BriefcaseBusiness" color="#2563eb" />
        <StatCard label="Active pickups" value={activeBookings.length} icon="Truck" color="#f59e0b" />
        <StatCard label="Today earnings" value={formatCurrency(todayEarnings)} icon="IndianRupee" color="#15803d" />
        <StatCard label="Inventory weight" value={totalWeight.toFixed(1)} unit="kg" icon="Archive" />
        <StatCard label="Digital lots" value={myLots.length} icon="Layers3" color="#0f766e" />
        <StatCard label="Recycler matches" value={recyclerMatches} icon="Factory" color="#9333ea" />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/collector/jobs', icon: BriefcaseBusiness, title: 'Find nearby work', text: `${available.length} listings accepting bids` },
          { to: '/collector/payments', icon: CreditCard, title: 'Payment Gateway', text: 'Razorpay UPI payout to Source' },
          { to: '/collector/scan', icon: ScanLine, title: 'Scan collected waste', text: 'Identify & add to inventory' },
          { to: '/collector/lots/new', icon: PackageCheck, title: 'Build digital lot', text: 'Bundle inventory for recycler' },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="card p-4 flex items-center gap-3 group hover:border-blue-300 transition-colors">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Icon size={20} /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</span>
              <span className="block text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </span>
            <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
          </Link>
        ))}
      </section>

      <MapView
        locations={collectorMapLocations}
        route={collectorDemoRoute}
        title="Pickup route & recycler access"
        description="See the active source destination and an authorized downstream facility in one demo route view."
        compact
      />

      {activeBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Today’s pickups</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Keep each hand-off updated for the source.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBookings.slice(0, 2).map((booking) => {
              const listing = listings.find((item) => item.id === booking.listingId);
              return (
                <button
                  type="button"
                  key={booking.id}
                  onClick={() => navigate(`/collector/pickups/${booking.id}`)}
                  className="card p-4 text-left flex items-center gap-4 hover:border-green-300 transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><Truck size={21} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{listing?.itemName ?? 'Scheduled pickup'}</span>
                      <StatusBadge status={booking.status} />
                    </span>
                    <span className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}><MapPin size={12} /> {booking.pickupAddress}</span>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>{formatDate(booking.scheduledAt, true)}</span>
                  </span>
                  <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nearby opportunities</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Active e-waste listings available for collection.</p>
          </div>
          <Link to="/collector/jobs" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--primary)' }}>View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {available.slice(0, 3).map((listing) => (
            <WasteCard key={listing.id} listing={listing} role="collector" onBid={openBid} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Bid activity</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your most recent offers · {formatCurrency(totalEarnings)} recorded earnings.</p>
            </div>
            <Banknote size={19} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="mt-4 divide-y" style={{ borderColor: 'var(--border)' }}>
            {myBids.length === 0 ? (
              <p className="py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>You have not placed a bid yet.</p>
            ) : myBids.slice(0, 4).map((bid) => (
              <button type="button" key={bid.id} onClick={() => navigate(`/collector/jobs/${bid.listingId}`)} className="w-full py-3 flex items-center justify-between gap-3 text-left">
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{listings.find((item) => item.id === bid.listingId)?.itemName ?? 'Listing'}</span>
                  <span className="block text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(bid.createdAt, true)}</span>
                </span>
                <span className="flex items-center gap-3"><span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(bid.offeredPrice)}</span><StatusBadge status={bid.status} /></span>
              </button>
            ))}
          </div>
        </div>
        <AwarenessCard card={awarenessCards[2]} />
      </section>

      <Modal
        isOpen={Boolean(selectedListing)}
        onClose={() => setBidListingId(null)}
        title={`Bid on ${selectedListing?.itemName ?? 'listing'}`}
        footer={(
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setBidListingId(null)}>Cancel</Button>
            <Button onClick={submitBid}>Send bid</Button>
          </div>
        )}
      >
        <label htmlFor="dashboard-bid-offer" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your offer (₹)</label>
        <input
          id="dashboard-bid-offer"
          type="number"
          min="1"
          step="1"
          value={offer}
          onChange={(event) => setOffer(event.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 mt-1.5 outline-none focus:ring-2 focus:ring-green-100"
          style={{ borderColor: 'var(--border)' }}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>The source expects approximately {formatCurrency(selectedListing?.expectedPrice ?? 0)}.</p>
      </Modal>
    </div>
  );
};

export default CollectorDashboardPage;
