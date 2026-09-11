import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, History, Leaf, Package, Recycle, ShieldCheck, Award } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Tabs from '../../components/Tabs';
import TraceabilityTimeline from '../../components/TraceabilityTimeline';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { WasteListing } from '../../types';
import { CATEGORY_LABELS, formatCurrency, formatDate, getTraceEvents, sortNewestFirst } from './sourceUtils';

type HistoryTab = 'all' | 'completed' | 'cancelled';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, bookings, transactions } = usePlatform();
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [traceListing, setTraceListing] = useState<WasteListing | null>(null);
  const [certListing, setCertListing] = useState<WasteListing | null>(null);

  const history = sortNewestFirst(listings.filter((listing) => !user?.id || listing.sourceId === user.id));
  const filtered = activeTab === 'all' ? history : history.filter((listing) => listing.status === activeTab);
  const responsibleItems = history.filter((listing) => ['picked_up', 'completed'].includes(listing.status));
  const divertedWeight = responsibleItems.reduce((sum, listing) => sum + listing.weightKg, 0);
  const itemCount = responsibleItems.reduce((sum, listing) => sum + listing.quantity, 0);
  const received = transactions
    .filter((transaction) => transaction.type === 'payment' && (!user?.id || transaction.userId === user.id))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const estimatedCo2Avoided = divertedWeight * 1.5;
  const selectedBooking = traceListing ? bookings.find((booking) => booking.listingId === traceListing.id) : undefined;

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="Circular journey"
        title="History & impact"
        description="Review earlier pickups and see the measurable impact of keeping electronics out of unsafe waste streams."
      />

      <section aria-label="Environmental impact" className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="E-waste diverted" value={divertedWeight.toFixed(1)} unit="kg" icon="Scale" />
        <StatCard label="Items handed over" value={itemCount} icon="PackageCheck" color="#0f766e" />
        <StatCard label="Estimated CO₂ avoided" value={estimatedCo2Avoided.toFixed(1)} unit="kg" icon="Leaf" color="#15803d" />
        <StatCard label="Payments received" value={formatCurrency(received)} icon="CircleDollarSign" color="#ca8a04" />
      </section>

      <div className="rounded-xl border px-4 py-3 flex items-start gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)' }}>
        <Leaf size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          CO₂ avoidance is an indicative estimate of 1.5 kg CO₂e per kilogram of electronics diverted. Actual savings vary by device type, reuse, transport, and material recovery.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All history', count: history.length },
          { id: 'completed', label: 'Completed', count: history.filter((listing) => listing.status === 'completed').length },
          { id: 'cancelled', label: 'Cancelled', count: history.filter((listing) => listing.status === 'cancelled').length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as HistoryTab)}
      />

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={History}
            title={history.length === 0 ? 'Your recycling history starts here' : `No ${activeTab} listings`}
            description={history.length === 0 ? 'Every e-waste listing and its traceable journey will be kept here.' : 'Try another history filter.'}
            actionLabel={history.length === 0 ? 'Create a listing' : undefined}
            onAction={history.length === 0 ? () => navigate('/source/sell') : undefined}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((listing) => {
            const booking = bookings.find((item) => item.listingId === listing.id);
            return (
              <article key={listing.id} className="card p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full h-36 md:w-20 md:h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    {listing.images[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={28} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{listing.itemName}</h2>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{CATEGORY_LABELS[listing.category]} · {formatDate(listing.updatedAt)}</p>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Weight</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{listing.weightKg} kg</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Items</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{listing.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collector</p>
                        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{booking?.collectorName ?? 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Listed value</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--primary)' }}>{formatCurrency(listing.expectedPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {listing.status !== 'cancelled' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--success)' }}>
                      <Recycle size={15} /> {listing.weightKg} kg kept in the circular chain
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>No environmental impact counted for cancelled listings.</span>
                  )}
                  <div className="flex items-center gap-4 ml-auto">
                    {['completed', 'picked_up'].includes(listing.status) && (
                      <button
                        type="button"
                        onClick={() => setCertListing(listing)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        <Award size={14} /> Certificate
                      </button>
                    )}
                    {listing.status !== 'cancelled' && (
                      <button type="button" onClick={() => setTraceListing(listing)} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                        Trace journey
                      </button>
                    )}
                    <Link to={`/source/listing/${listing.id}`} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={Boolean(traceListing)} onClose={() => setTraceListing(null)} title="Traceable recycling journey" size="xl">
        {traceListing && (
          <div>
            <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: 'var(--primary-subtle)' }}>
              <ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{traceListing.itemName}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Listing {traceListing.id}</p>
              </div>
            </div>
            <TraceabilityTimeline events={getTraceEvents(traceListing, selectedBooking)} variant="responsive" transactionId={`RC-${traceListing.id.toUpperCase()}`} />
          </div>
        )}
      </Modal>

      {certListing && (
        <GreenCertificateModal
          isOpen={Boolean(certListing)}
          onClose={() => setCertListing(null)}
          certificateData={{
            certId: `CPCB-RC-2026-IND-${certListing.id.replace(/\D/g, '').padStart(5, '0') || '84291'}`,
            itemName: certListing.itemName,
            category: `${certListing.category.toUpperCase()} (E-Waste Form-1 Certified)`,
            weightKg: certListing.weightKg,
            sellerName: user?.name || 'Verified Source Partner',
            completedAt: formatDate(certListing.updatedAt),
            goldGrams: parseFloat((certListing.weightKg * 0.28).toFixed(2)),
            copperKg: parseFloat((certListing.weightKg * 0.24).toFixed(2)),
            co2SavedKg: parseFloat((certListing.weightKg * 1.5).toFixed(1)),
            hash: `${certListing.id}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
          }}
        />
      )}
    </div>
  );
};

export default HistoryPage;
