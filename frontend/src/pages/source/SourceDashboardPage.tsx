import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Leaf,
  Plus,
  Scale,
  Award,
  Gamepad2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import NotificationCard from '../../components/NotificationCard';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import WasteCard from '../../components/WasteCard';
import MapView from '../../components/MapView';
import AwarenessCard from '../../components/AwarenessCard';
import TransactionCard from '../../components/TransactionCard';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency, formatDate, isOpenBooking, isOpenListing, sortNewestFirst } from './sourceUtils';
import { sourceDemoRoute, sourceMapLocations } from '../../data/locations';
import { awarenessCards } from '../../data/awareness';

const SourceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, bids, bookings, notifications, transactions, markNotificationRead } = usePlatform();

  const myListings = sortNewestFirst(
    listings.filter((listing) => !user?.id || listing.sourceId === user.id),
  );
  const listingIds = new Set(myListings.map((listing) => listing.id));
  const myBids = bids.filter((bid) => listingIds.has(bid.listingId));
  const myBookings = bookings.filter(
    (booking) => (!user?.id || booking.sourceId === user.id) && listingIds.has(booking.listingId),
  );
  const openBookings = myBookings
    .filter((booking) => isOpenBooking(booking.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const unread = notifications.filter((notification) => !notification.isRead);
  const myTransactions = transactions.filter((transaction) => !user?.id || transaction.userId === user.id);
  const totalReceived = myTransactions
    .filter((transaction) => transaction.type === 'payment')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const recycledWeight = myListings
    .filter((listing) => ['picked_up', 'completed'].includes(listing.status))
    .reduce((sum, listing) => sum + listing.weightKg, 0);

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-7">
      <PageHeader
        eyebrow="Source dashboard"
        title={`Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Track your listings, compare collector bids, and follow every pickup through the recycling chain."
        actions={(
          <Link
            to="/source/sell"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={17} /> Sell e-waste
          </Link>
        )}
      />

      <section aria-label="Account overview" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          label="Open listings"
          value={myListings.filter((listing) => isOpenListing(listing.status)).length}
          icon="PackageCheck"
        />
        <StatCard label="Collector bids" value={myBids.filter((bid) => bid.status === 'pending').length} icon="Gavel" color="#2563eb" />
        <StatCard label="Active pickups" value={openBookings.length} icon="Truck" color="#b56d11" />
        <StatCard label="Recycled responsibly" value={recycledWeight.toFixed(1)} unit="kg" icon="Scale" color="#0f766e" />
        <StatCard label="Payments received" value={formatCurrency(totalReceived)} icon="IndianRupee" color="#ca8a04" />
      </section>

      {openBookings[0] && (
        <section className="card overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <CalendarCheck size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Next pickup</p>
                <StatusBadge status={openBookings[0].status} />
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {openBookings[0].collectorName} · {formatDate(openBookings[0].scheduledAt, true)}
              </p>
              <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{openBookings[0].pickupAddress}</p>
            </div>
            <Link
              to={`/source/bookings/${openBookings[0].id}`}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              Track pickup <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}

      <MapView
        locations={sourceMapLocations}
        route={sourceDemoRoute}
        title="Pickup location & nearby collectors"
        description="Compare demo collector distance, arrival time, rating and offer around your saved pickup point."
        compact
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent listings</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your latest e-waste requests and their live status.</p>
            </div>
            {myListings.length > 0 && (
              <Link to="/source/history" className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--primary)' }}>
                View all
              </Link>
            )}
          </div>

          {myListings.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Plus}
                title="No e-waste listed yet"
                description="Create your first listing to receive offers from nearby verified collectors."
                actionLabel="Create a listing"
                onAction={() => navigate('/source/sell')}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myListings.slice(0, 4).map((listing) => <WasteCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </section>

        <aside className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Updates</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{unread.length} unread notification{unread.length === 1 ? '' : 's'}</p>
            </div>
            <Bell size={19} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="card overflow-hidden">
            {notifications.length === 0 ? (
              <EmptyState icon={Bell} title="You are all caught up" description="Bid and pickup updates will appear here." />
            ) : (
              notifications.slice(0, 4).map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    if (notification.linkTo) navigate(notification.linkTo);
                  }}
                />
              ))
            )}
          </div>

          {/* Eco-Points & Gamification Banner */}
          <div className="card p-5 mt-5 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-900/5 border border-amber-500/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Sparkles size={14} className="animate-pulse" /> 2,450 Eco-Points
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                Level 4
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Gamepad2 size={16} className="text-emerald-600" /> Eco-Sort Arcade
            </h3>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
              Sort electronic parts in real-time, dodge hazards, and redeem points for planted trees and pickup perks.
            </p>
            <Link
              to="/source/gamification"
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              Play Game & Claim Rewards <ArrowRight size={14} />
            </Link>
          </div>

          {/* Green Compliance Certificates Quick Widget */}
          <div className="card p-5 mt-5 border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Green Certificates</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Official CPCB Form-1 compliance certificates verifying toxic destruction and critical mineral recovery.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                3 Certified Lots
              </span>
              <Link
                to="/source/certificates"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View Registry <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="card p-5 mt-5" style={{ backgroundColor: 'var(--primary-subtle)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your estimated impact</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{(recycledWeight * 1.5).toFixed(1)} kg</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              estimated CO₂-equivalent emissions avoided, using a simple 1.5 kg per kg e-waste indicator.
            </p>
          </div>
          <div className="mt-5"><AwarenessCard card={awarenessCards[3]} compact /></div>
          {myTransactions[0] && <div className="mt-5"><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-tertiary)' }}>Recent transaction</h3><TransactionCard transaction={myTransactions[0]} compact /></div>}
        </aside>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Plus, title: 'List another item', copy: 'Photograph and describe your e-waste.', to: '/source/sell' },
          { icon: CalendarCheck, title: 'Manage pickups', copy: 'Review pickup times and secure OTPs.', to: '/source/bookings' },
          { icon: Scale, title: 'View your impact', copy: 'Follow materials through the chain.', to: '/source/history' },
          { icon: Award, title: 'CPCB Certificates', copy: 'Print Form-1 recovery records.', to: '/source/certificates' },
          { icon: Gamepad2, title: 'Eco-Sort Arcade', copy: 'Play game & redeem rewards.', to: '/source/gamification' },
        ].map(({ icon: Icon, title, copy, to }) => (
          <Link key={to + title} to={to} className="card p-4 flex items-start gap-3 transition-transform hover:-translate-y-0.5">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Icon size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
              <span className="block text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{copy}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default SourceDashboardPage;
